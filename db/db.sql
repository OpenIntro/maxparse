-- phpMyAdmin SQL Dump
-- version 4.7.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql.etrbe.com
-- Generation Time: Aug 16, 2017 at 01:26 PM
-- Server version: 5.6.34-log
-- PHP Version: 7.1.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `maxparseffs`
--
CREATE DATABASE IF NOT EXISTS `maxparseffs` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `maxparseffs`;

-- --------------------------------------------------------

--
-- Table structure for table `campaign`
--

CREATE TABLE `campaign` (
  `campaign_id` int(11) NOT NULL,
  `vendor_email` varchar(100) NOT NULL,
  `campaign_code` int(11) NOT NULL,
  `vendor_id` int(11) DEFAULT NULL,
  `sequence_code` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `parse`
--

CREATE TABLE `parse` (
  `id` int(11) NOT NULL,
  `vendor_email` text,
  `campaign_code` varchar(11) DEFAULT NULL,
  `vendor_id` varchar(11) DEFAULT NULL,
  `sequence_code` varchar(11) DEFAULT NULL,
  `lead_date` datetime NOT NULL,
  `email` varchar(100) NOT NULL,
  `f_name` varchar(100) NOT NULL,
  `l_name` varchar(100) NOT NULL,
  `street_address` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zipcode` int(11) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `dma` varchar(100) DEFAULT NULL,
  `fadaf` varchar(100) DEFAULT NULL,
  `optin` varchar(100) DEFAULT NULL,
  `intent` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `parse`
--

INSERT INTO `parse` (`id`, `vendor_email`, `campaign_code`, `vendor_id`, `sequence_code`, `lead_date`, `email`, `f_name`, `l_name`, `street_address`, `city`, `state`, `zipcode`, `phone`, `dma`, `fadaf`, `optin`, `intent`) VALUES
(182, 'prathamesh@musicaudience.net', '560000', '0000000353', '001', '2017-08-01 13:24:25', '8@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave..', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(183, 'prathamesh@musicaudience.net', '560001', '0000000353', '001', '2017-08-01 13:25:11', '8@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave ', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(184, 'prathamesh@musicaudience.net', '560002', '0000000353', '001', '2017-08-01 13:26:03', '8@yahoo.com', 'Juan Ernesto', 'Cabrales', ' ', 'Chaparral', 'AZ', 0, 'p:+1(575) 915-0205', '', '', '', ''),
(185, 'prathamesh@musicaudience.net', '560003', '0000000353', '001', '2017-08-01 13:27:20', '8@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave ', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(186, 'prathamesh@musicaudience.net', '560011', '0000000353', '001', '2017-08-01 13:44:57', '78@yahoo.com', 'Juan Ernesto', 'Cabrales', '..', 'Chaparral', 'AZ', 0, 'p:+1(575) 915-0205', '', '', '', ''),
(187, 'prathamesh@musicaudience.net', '560011', '0000000353', '001', '2017-08-01 13:44:58', '88@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave..', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(188, 'prathamesh@musicaudience.net', '560011', '0000000353', '001', '2017-08-01 13:44:58', '68@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave ', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(189, 'prathamesh@musicaudience.net', '560011', '0000000353', '002', '2017-08-01 13:46:41', '78@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave..', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(190, 'prathamesh@musicaudience.net', '560011', '0000000353', '002', '2017-08-01 13:46:41', '88@yahoo.com', 'Juan Ernesto', 'Cabrales', '..', 'Chaparral', 'AZ', 0, 'p:+1(575) 915-0205', '', '', '', ''),
(191, 'prathamesh@musicaudience.net', '560011', '0000000353', '002', '2017-08-01 13:47:57', '68@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave..', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(192, 'sean@leadingresponse.com', '22222222', '0000000353', '111', '2017-08-07 14:44:50', '88@yahoo.com', 'Juan Ernesto', 'Cabrales', '..', 'Chaparral', 'AZ', 0, 'p:+1(575) 915-0205', '', '', '', ''),
(193, 'sean@leadingresponse.com', '0000000001', '0000000353', '100', '2017-08-08 12:12:44', '88@yahoo.com', 'Juan Ernesto', 'Cabrales', ' ', 'Chaparral', 'AZ', 0, 'p:+1(575) 915-0205', '', '', '', ''),
(194, 'sean@leadingresponse.com', '0000000002', '0000000353', '000', '2017-08-08 12:14:03', '88@yahoo.com', 'Bobby', 'Bernal', '1401 W Keating Ave ', 'Mesa', 'AZ', 85202, '602-245-3714', '', '', 'TRUE', 'E'),
(195, 'sean@leadingresponse.com', '000000003', '0000000353', '111', '2017-08-08 12:15:27', '88@yahoo.com', 'Juan Ernesto', 'Cabrales', ' ', 'Chaparral', 'AZ', 0, 'p:+1(575) 915-0205', '', '', '', ''),
(196, 'sean@leadingresponse.com', '43', '0000000353', '444', '2017-08-08 12:20:55', '88@yahoo.com', 'Juan Ernesto', 'Cabrales', ' ', 'Chaparral', 'AZ', 0, 'p:+1(575) 915-0205', '', '', '', ''),
(222, 'sean@leadingresponse.com', '1111111111', '0000000353', '111', '2017-08-10 13:41:01', '88@yahoo.com', 'Juan Ernesto', 'Cabrales', '728 hermosa..', 'Chaparral', 'AZ', 85202, 'p:+1(575) 915-0205', '', '', '', '7+_Months');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `campaign`
--
ALTER TABLE `campaign`
  ADD PRIMARY KEY (`campaign_id`);

--
-- Indexes for table `parse`
--
ALTER TABLE `parse`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `campaign`
--
ALTER TABLE `campaign`
  MODIFY `campaign_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;
--
-- AUTO_INCREMENT for table `parse`
--
ALTER TABLE `parse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=223;COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
