import { Injectable } from '@angular/core';
import { Room } from "../models/room.model";
import { RoomType } from "../models/room-type.model";
import { CleaningStatus } from "../models/cleaning-status.model";
import { BookingStatus } from "../models/booking-status.model";
import { HttpClient } from "@angular/common/http";
import { HandleError } from "./service-helper";
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable()
export class CollectionsService {
	private collectionsUrl = `${environment.apiBaseUrl}/collections`;

	constructor(private http: HttpClient) { }

	getRooms(): Promise<Room[]>{
		return firstValueFrom(this.http.get(`${this.collectionsUrl}/rooms`))
			.catch(HandleError);
	}

	updateRoom(room: Room): Promise<void> {
		return firstValueFrom(this.http.put(`${this.collectionsUrl}/rooms/${room.id}`, room))
			.catch(HandleError);
	}

	getRoomTypes(): Promise<RoomType[]>{
		return firstValueFrom(this.http.get(`${this.collectionsUrl}/roomTypes`))
			.catch(HandleError);
	}

	getCleaningStatuses(): Promise<CleaningStatus[]>{
		return firstValueFrom(this.http.get(`${this.collectionsUrl}/cleaningStatuses`))
			.catch(HandleError);
	}

	getBookingStatuses(): Promise<BookingStatus[]>{
		return firstValueFrom(this.http.get(`${this.collectionsUrl}/bookingStatuses`))
			.catch(HandleError);
	}
}
