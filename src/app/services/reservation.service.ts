import { Injectable } from '@angular/core';
import { Reservation } from "../models/reservation.model";
import { HttpClient } from "@angular/common/http";
import { HandleError } from "./service-helper";
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable()
export class ReservationService {
	private reservationUrl = `${environment.apiBaseUrl}/reservations`;

	constructor(private http: HttpClient) { }

	get(): Promise<Reservation[]>{
		return firstValueFrom(this.http.get(this.reservationUrl))
			.catch(HandleError);
	}

	insert(reservation: Reservation): Promise<Reservation> {
		return firstValueFrom(this.http.post(this.reservationUrl, reservation))
			.catch(HandleError);
	}

	update(reservation: Reservation): Promise<void> {
		return firstValueFrom(this.http.put(`${this.reservationUrl}/${reservation.id}`, reservation))
			.catch(HandleError);
	}

	remove(id: number): Promise<void> {
		return firstValueFrom(this.http.delete(`${this.reservationUrl}/${id}`))
			.catch(HandleError);
	}
}
