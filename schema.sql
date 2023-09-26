CREATE TABLE IF NOT EXISTS `reservations` (
  `id` bigint(20) unsigned AUTO_INCREMENT,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `text` varchar(255) DEFAULT NULL,
  `room` varchar(255) DEFAULT NULL,
  `booking_status` varchar(255) DEFAULT NULL,
  `is_paid` BOOLEAN DEFAULT NULL CHECK (is_paid IN (0, 1)),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` bigint(20) unsigned AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `cleaning_status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `roomTypes` (
  `id` bigint(20) unsigned AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `cleaningStatuses` (
  `id` bigint(20) unsigned AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `bookingStatuses` (
  `id` bigint(20) unsigned AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;