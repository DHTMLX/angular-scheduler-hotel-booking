function callMethod (method) {
	return async (req, res) => {
		let result;

		try {
			result = await method(req, res);
		} catch (e) {
			result =  {
				action: 'error',
				message: e.message
			}
		}

		res.send(result);
	}
};

module.exports = {
	setRoutes (app, prefix, databaseHandler) {
		/// ↓↓↓ reservations router ↓↓↓
		app.get(`${prefix}/reservations`, callMethod((req) => {
			return databaseHandler.getAllReservations(req.query);
		}));

		app.post(`${prefix}/reservations`, callMethod((req) => {
			return databaseHandler.insert(req.body);
		}));

		app.put(`${prefix}/reservations/:id`, callMethod((req) => {
			return databaseHandler.update(req.params.id, req.body);
		}));

		app.delete(`${prefix}/reservations/:id`, callMethod((req) => {
			return databaseHandler.delete(req.params.id);
		}));
		/// ↑↑↑ reservations router ↑↑↑
		
		/// ↓↓↓ rooms router ↓↓↓
		app.get(`${prefix}/collections/rooms`, callMethod((req) => {
			return databaseHandler.getAllRooms(req.query);
		}));

		app.put(`${prefix}/collections/rooms/:id`, callMethod((req) => {
			return databaseHandler.updateRoomCleaningStatus(req.params.id, req.body);
		}));
		/// ↑↑↑ rooms router ↑↑↑

		/// ↓↓↓ room types router ↓↓↓
		app.get(`${prefix}/collections/roomTypes`, callMethod((req) => {
			return databaseHandler.getRoomTypes(req.query);
		}));
		/// ↑↑↑ room types router ↑↑↑

		/// ↓↓↓ cleaning statuses router ↓↓↓
		app.get(`${prefix}/collections/cleaningStatuses`, callMethod((req) => {
			return databaseHandler.getCleaningStatuses(req.query);
		}));
		/// ↑↑↑ cleaning statuses router ↑↑↑

		/// ↓↓↓ booking statuses router ↓↓↓
		app.get(`${prefix}/collections/bookingStatuses`, callMethod((req) => {
			return databaseHandler.getBookingStatuses(req.query);
		}));
		/// ↑↑↑ booking statuses router ↑↑↑
	}
};
