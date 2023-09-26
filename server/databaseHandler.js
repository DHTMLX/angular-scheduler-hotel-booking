require('date-format-lite'); // add date format

class DatabaseHandler {
	constructor(connection, table) {
		this._db = connection;
		this.table = 'reservations';
	}

	/// ↓↓↓ reservations handler ↓↓↓
	// get reservations, use dynamic loading if parameters sent
	async getAllReservations(params) {
		let query = 'SELECT * FROM ??';
		let queryParams = [
			this.table
		];
		
		let result = await this._db.query(query, queryParams);

		result.forEach((entry) => {
			// format date and time
			entry.start_date = entry.start_date.format('YYYY-MM-DD hh:mm');
			entry.end_date = entry.end_date.format('YYYY-MM-DD hh:mm');
		});

		return result;
	}

	// create new reservation
	async insert(data) {
		let result = await this._db.query(
			'INSERT INTO ?? (`start_date`, `end_date`, `text`, `room`, `booking_status`, `is_paid`) VALUES (?,?,?,?,?,?)',
			[this.table, data.start_date, data.end_date, data.text, data.room, data.booking_status, data.is_paid]);

		return {
			action: 'inserted',
			tid: result.insertId
		}
	}

	// update reservation
	async update(id, data) {
		await this._db.query(
			'UPDATE ?? SET `start_date` = ?, `end_date` = ?, `text` = ?, `room` = ?, `booking_status` = ?, `is_paid` = ? WHERE id = ?',
			[this.table, data.start_date, data.end_date, data.text, data.room, data.booking_status, data.is_paid, id]);

		return {
			action: 'updated'
		}
	}

	// delete reservation
	async delete(id) {
		await this._db.query(
			'DELETE FROM ?? WHERE `id`=? ;',
			[this.table, id]);

		return {
			action: 'deleted'
		}
	}
	/// ↑↑↑ reservations handler ↑↑↑

	/// ↓↓↓ room cleanup status handler ↓↓↓
	// get rooms
	async getAllRooms(params) {
		let query = 'SELECT * FROM ??';
		let queryParams = [
			'rooms'
		];
		
		let result = await this._db.query(query, queryParams);

		return result;
	}

	// update room cleanup status
	async updateRoomCleaningStatus(id, data) {
		await this._db.query(
			'UPDATE ?? SET `value` = ?, `label` = ?, `type` = ?, `cleaning_status` = ? WHERE id = ?',
			['rooms', data.key, data.label, data.type, data.cleaning_status, id]);

		return {
			action: 'updated'
		}
	}
	/// ↑↑↑ room cleanup status handler ↑↑↑

	/// ↓↓↓ get room types ↓↓↓
	async getRoomTypes(params) {
		let query = 'SELECT * FROM ??';
		let queryParams = [
			'roomTypes'
		];
		
		let result = await this._db.query(query, queryParams);

		return result;
	}
	/// ↑↑↑ get room types ↑↑↑

	/// ↓↓↓ get cleaning statuses ↓↓↓
	async getCleaningStatuses(params) {
		let query = 'SELECT * FROM ??';
		let queryParams = [
			'cleaningStatuses'
		];
		
		let result = await this._db.query(query, queryParams);

		return result;
	}
	/// ↑↑↑ get cleaning statuses ↑↑↑

	/// ↓↓↓ get booking statuses ↓↓↓
	async getBookingStatuses(params) {
		let query = 'SELECT * FROM ??';
		let queryParams = [
			'bookingStatuses'
		];
		
		let result = await this._db.query(query, queryParams);

		return result;
	}
	/// ↑↑↑ get booking statuses ↑↑↑
}

module.exports = DatabaseHandler;
