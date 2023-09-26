import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Scheduler } from 'dhtmlx-scheduler';
import { Reservation } from "../models/reservation.model";
import { Room } from "../models/room.model";
import { ReservationService } from '../services/reservation.service';
import { CollectionsService } from '../services/collections.service';
import { forkJoin } from 'rxjs';

@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'scheduler',
	styleUrls: ['./scheduler.component.css'],
	templateUrl: './scheduler.component.html',
	providers: [ ReservationService, CollectionsService ]
})

export class SchedulerComponent implements OnInit {
	@ViewChild('scheduler_here', {static: true}) schedulerContainer!: ElementRef;
	private scheduler: any;
	rooms: any[] = [];
	roomTypes: any[] = [];
	cleaningStatuses: any[] = [];
	bookingStatuses: any[] = [];
	selectedRoomType: string = '';

	constructor(
		private reservationService: ReservationService,
		private collectionsService: CollectionsService
	) { }

	public filterRoomsByType(value: string): void {
		const currentRooms = value === 'all' ? this.rooms.slice() : this.rooms.filter(room => room.type === value);
		this.scheduler.updateCollection('currentRooms', currentRooms);
	};

	ngOnInit() {
		const scheduler = Scheduler.getSchedulerInstance();
		this.scheduler = scheduler;
		this.selectedRoomType = 'all';

		scheduler.plugins({
			limit: true,
			collision: true,
			timeline: true,
			editors: true,
			minical: true,
			tooltip: true
		});

		scheduler.locale.labels['section_text'] = 'Name';
		scheduler.locale.labels['section_room'] = 'Room';
		scheduler.locale.labels['section_booking_status'] = 'Booking Status';
		scheduler.locale.labels['section_is_paid'] = 'Paid';
		scheduler.locale.labels.section_time = 'Time';
		scheduler.xy.scale_height = 30;

		scheduler.config.details_on_create = true;
		scheduler.config.details_on_dblclick = true;
		scheduler.config.prevent_cache = true;
		scheduler.config.show_loading = true;
		scheduler.config.date_format = '%Y-%m-%d %H:%i';

		this.rooms = scheduler.serverList('rooms');
		this.roomTypes = scheduler.serverList('roomTypes');
		this.cleaningStatuses = scheduler.serverList('cleaningStatuses');
		this.bookingStatuses = scheduler.serverList('bookingStatuses');

		scheduler.config.lightbox.sections = [
			{ name: 'text',           map_to: 'text',           type: 'textarea', height: 24 },
			{ name: 'room',           map_to: 'room',           type: 'select', options: scheduler.serverList("currentRooms") },
			{ name: 'booking_status', map_to: 'booking_status', type: 'radio', options: scheduler.serverList('bookingStatuses') },
			{ name: 'is_paid',        map_to: 'is_paid',        type: 'checkbox', checked_value: true, unchecked_value: false },
			{ name: 'time',           map_to: 'time',           type: 'calendar_time' }
		];

		scheduler.locale.labels['timeline_tab'] = 'Timeline';

		scheduler.createTimelineView({
			name: 'timeline',
			y_property:	'room',
			render: 'bar',
			x_unit: 'day',
			x_date: '%d',
			dy: 52,
			event_dy: 48,
			section_autoheight: false,
	
			y_unit: scheduler.serverList('currentRooms'),
			second_scale: {
				x_unit: 'month',
				x_date: '%F %Y'
			},
			columns: [
				{ label: 'Room', width: 70, template: (room: Room) => room.label },
				{ label: 'Type', width: 90, template: (room: Room) => this.getRoomType(room.type) },
				{ label: 'Status', width: 90, template: this.generateCleaningStatusColumnTemplate.bind(this) }
			]
		});

		this.schedulerContainer.nativeElement.addEventListener('input', (event: any) => {
			const target =  event.target as HTMLSelectElement;

			if (target instanceof HTMLElement && target.closest('.cleaning-status-select')) {
				this.handleCleaningStatusChange(target);
			}
		});

		scheduler.date['timeline_start'] = scheduler.date.month_start;
		scheduler.date['add_timeline'] = (date: any, step: any) => scheduler.date.add(date, step, 'month');

		scheduler.attachEvent('onBeforeViewChange', (old_mode, old_date, mode, date) => {
			const year = date.getFullYear();
			const month = (date.getMonth() + 1);
			const d = new Date(year, month, 0);
			const daysInMonth = d.getDate();
			scheduler.matrix['timeline'].x_size = daysInMonth;

			return true;
		}, {});
	
		scheduler.templates.event_class = (start, end, event) => 'event_' + (event.booking_status || '');
	
		function getPaidStatus(isPaid: any) {
			return isPaid ? 'paid' : 'not paid';
		}

		const eventDateFormat = scheduler.date.date_to_str('%d %M %Y');
		
		scheduler.templates.event_bar_text = (start, end, event) => {
			const paidStatus = getPaidStatus(event.is_paid);
			const startDate = eventDateFormat(event.start_date);
			const endDate = eventDateFormat(event.end_date);

			return [event.text + '<br />',
				startDate + ' - ' + endDate,
				`<div class='booking_status booking-option'>${this.getBookingStatus(event.booking_status)}</div>`,
				`<div class='booking_paid booking-option'>${paidStatus}</div>`].join('');
		};
	
		scheduler.templates.tooltip_text = (start, end, event) => {
			const room = this.getRoom(event.room) || {label: ''};
	
			const html = [];
			html.push('Booking: <b>' + event.text + '</b>');
			html.push('Room: <b>' + room.label + '</b>');
			html.push('Check-in: <b>' + eventDateFormat(start) + '</b>');
			html.push('Check-out: <b>' + eventDateFormat(end) + '</b>');
			html.push(this.getBookingStatus(event.booking_status) + ', ' + getPaidStatus(event.is_paid));

			return html.join('<br>')
		};

		scheduler.templates.lightbox_header = (start, end, ev) => {
			const formatFunc = scheduler.date.date_to_str('%d.%m.%Y');

			return formatFunc(start) + ' - ' + formatFunc(end);
		};
	
		scheduler.attachEvent('onEventCollision', (ev, evs) => {
			for (let i = 0; i < evs.length; i++) {
				if (ev.room != evs[i].room) {
					continue;
				}
				
				scheduler.message({
					type: 'error',
					text: 'This room is already booked for this date.'
				});
			}

			return true;
		}, {});
	
		scheduler.attachEvent('onEventCreated', (event_id) => {
			const ev = scheduler.getEvent(event_id);
			ev.booking_status = 1;
			ev.is_paid = false;
			ev.text = 'new booking';
		}, {});
	
		scheduler.addMarkedTimespan({days: [0, 6], zones: 'fullday', css: 'timeline_weekend'});

		function setHourToNoon(event: any) {
			event.start_date.setHours(12, 0, 0);
			event.end_date.setHours(12, 0, 0);
		}

		scheduler.attachEvent('onEventLoading', (ev) => {
			this.filterRoomsByType('all');
			const select = document.getElementById('room_filter') as HTMLSelectElement;

			if (select !== null) {
				const selectHTML = [`<option value='all'>All</option>`];

				for (let i = 1; i < this.roomTypes.length + 1; i++) {
					const roomType = this.roomTypes[i-1];
					selectHTML.push(`<option value='${roomType.key}'>${this.getRoomType(roomType.key)}</option>`);
				}

				select.innerHTML = selectHTML.join('');
			}

			setHourToNoon(ev);

			return true;
		}, {});
		
		scheduler.attachEvent('onEventSave', (id, ev, is_new) => {
			if (!ev.text) {
				scheduler.alert('Text must not be empty');

				return false;
			}

			setHourToNoon(ev);

			return true;
		}, {});

		scheduler.attachEvent('onEventChanged', (id, ev) => {
			setHourToNoon(ev);
		}, {});

		scheduler.init(this.schedulerContainer.nativeElement, new Date(), 'timeline');

		const dp = scheduler.createDataProcessor({
			event: {
				create: (data: Reservation) => this.reservationService.insert(data),
				update: (data: Reservation) => this.reservationService.update(data),
				delete: (id: number) => this.reservationService.remove(id),
			}
		});
				
		forkJoin({
			reservations: this.reservationService.get(),
			rooms: this.collectionsService.getRooms(),
			roomTypes: this.collectionsService.getRoomTypes(),
			cleaningStatuses: this.collectionsService.getCleaningStatuses(),
			bookingStatuses: this.collectionsService.getBookingStatuses()
		}).subscribe({
			next: ({ reservations, rooms, roomTypes, cleaningStatuses, bookingStatuses }) => {
				const data = {
					events: reservations,
					collections: {
						rooms,
						roomTypes,
						cleaningStatuses,
						bookingStatuses,
					}
				};
		
				scheduler.parse(data);
			},
			error: error => {
				console.error('An error occurred:', error);
			}
		});
	}

	ngOnDestroy() {
		const scheduler = this.scheduler;
		scheduler && scheduler.destructor();
	}
	
	getRoom(key: any) {
		return this.rooms.find(room => room.key === key) || null;
	}

	getRoomType(key: any) {
		const roomType = this.roomTypes.find(item => item.key === key);

		return roomType ? roomType.label : null;
	}

	getCleaningStatus(key: any) {
		const cleaningStatus = this.cleaningStatuses.find(item => item.key === key);

		return cleaningStatus ? cleaningStatus.label : null;
	}

	getCleaningStatusIndicator(key: any) {
		const cleaningStatus = this.cleaningStatuses.find(item => item.key === key);

		return cleaningStatus ? cleaningStatus.color : null;
	}
	
	getBookingStatus(key: any) {
		const bookingStatus = this.bookingStatuses.find(item => item.key === key);

		return bookingStatus ? bookingStatus.label : '';
	}

	handleCleaningStatusChange(target: HTMLSelectElement) {
		const roomId = target.getAttribute('room-id');
		const selectedCleaningStatus = target.value;
		const roomToUpdate = this.rooms.find(room => room.id == roomId);

		if (roomToUpdate) {
			roomToUpdate.cleaning_status = selectedCleaningStatus;
		}
	
		const backgroundColor = this.getCleaningStatusIndicator(selectedCleaningStatus);
		target.style.backgroundColor = backgroundColor;
		this.collectionsService.updateRoom(roomToUpdate);
	}

	generateCleaningStatusColumnTemplate(room: Room) {
		const backgroundColor = this.getCleaningStatusIndicator(room.cleaning_status);
		const rgbaBackgroundColor = this.hexToRgba(backgroundColor, 0.2);
	
		const selectHTML = [`
			<select class='cleaning-status-select'
				room-id='${room.id}'
				style='width: 100%; height: 52px; background-color: ${rgbaBackgroundColor}; outline: none; border: none;'>
		`];
	
		this.cleaningStatuses.forEach(status => {
			const optionHTML = `
				<option value='${status.key}' style='background-color: ${status.color};' ${room.cleaning_status === status.key ? 'selected' : ''}>
				${this.getCleaningStatus(status.key)}
				</option>
			`;
			selectHTML.push(optionHTML);
		});
	
		selectHTML.push(`</select>`);
	
		return selectHTML.join('');
	}

	hexToRgba(hex: any, alpha: any) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
}
