-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 18, 2025 at 02:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qr_attendance`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_scanned` datetime DEFAULT current_timestamp(),
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('Present','Absent','Late') DEFAULT 'Present'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `user_id`, `date_scanned`, `time_in`, `time_out`, `status`) VALUES
(41, 96, '2025-09-16 11:32:22', '11:32:22', '11:38:02', 'Absent'),
(42, 96, '2025-09-17 20:19:43', '20:19:43', '20:23:07', 'Absent');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `message` varchar(255) NOT NULL,
  `date_created` datetime DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `teacher_id`, `user_id`, `student_id`, `type`, `message`, `date_created`, `is_read`) VALUES
(9, 94, NULL, 97, 'late_absent', 'Students 2 is absent at 11:25:06', '2025-09-16 11:25:06', 0),
(10, 94, NULL, 96, 'late_absent', 'Student 1 is absent at 11:28:07', '2025-09-16 11:28:07', 0),
(11, 94, NULL, 96, 'late_absent', 'Student 1 has been marked absent for today.', '2025-09-16 11:32:22', 0),
(12, 94, NULL, 96, 'late_absent', 'Student 1 has been marked absent for today.', '2025-09-17 20:19:43', 0);

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `strand_id` int(11) NOT NULL,
  `section_name` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `strand_id`, `section_name`) VALUES
(3, 3, 'Section A'),
(4, 3, 'Section B'),
(6, 4, 'Section B'),
(8, 5, 'Section A');

-- --------------------------------------------------------

--
-- Table structure for table `strands`
--

CREATE TABLE `strands` (
  `strand_id` int(11) NOT NULL,
  `strand_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `strands`
--

INSERT INTO `strands` (`strand_id`, `strand_name`) VALUES
(3, 'STEM'),
(4, 'ABM'),
(5, 'HUMMS');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `grade_level` varchar(50) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('admin','teacher','student') NOT NULL DEFAULT 'student',
  `teacher_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `username`, `grade_level`, `section_id`, `email`, `password_hash`, `role`, `teacher_id`, `created_at`, `updated_at`) VALUES
(93, 'admin', 'admin', 'N/A', NULL, 'admin@gmail.com', '$2b$10$9pNa5liDCCnGi.lhTFDpo.i/oB917SvJeeW4IV/xcV1FHf12HlNde', 'admin', NULL, '2025-09-13 10:17:13', '2025-09-13 10:18:19'),
(94, 'Teacher 1', NULL, 'N/A', NULL, 'teacher1@gmail.com', '$2b$10$OqeDeFdXIjGu0fRRarRt8umYnw8QlGzntXOYxft5YPXlx9itvin8O', 'teacher', NULL, '2025-09-13 10:31:18', '2025-09-13 10:31:18'),
(95, 'teacher 2', NULL, 'N/A', NULL, 'teacher2@gmail.com', '$2b$10$g5VIf5pxy1xywv8Li9IF6.jCLp6S1RA6Y/YBRkNTlIh3qTq60CPOi', 'teacher', NULL, '2025-09-13 10:32:00', '2025-09-13 10:51:09'),
(96, 'Sieba Damucay', 'Student 1', 'Grade 11', 3, NULL, '$2b$10$7vCtOYPyBFvMrWIX66tNsOeYF8UOJ4l5uRud4820/l/JFpx6j7AIu', 'student', 94, '2025-09-13 10:41:51', '2025-09-13 10:41:51'),
(97, 'Brenelyn Moheng', 'Students 2', 'Grade 11', 4, NULL, '$2b$10$diOEBDaNthUlWiCVHigkquYeHy7vIa3SHq9cXYwk6ZICKx/eKZtzC', 'student', 94, '2025-09-13 10:50:17', '2025-09-13 10:50:17'),
(98, 'Student 3', 'Student 3', 'Grade 11', 3, NULL, '$2b$10$hRm27zZ/wccZ6InFWsT5reYEi.GY998.7RjgHT3qlXxaYvN1EVLza', 'student', 94, '2025-09-13 11:49:41', '2025-09-13 11:49:41'),
(101, 'Ana Reyes', 'anareyes', 'Grade 11', 6, NULL, '$2b$10$.1A3ld0FNxUGIm2lwQOuWeRMEguPZITbP7im9VdQgZqyxyT2Hjsp2', 'student', 94, '2025-09-13 15:02:04', '2025-09-13 15:02:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`),
  ADD KEY `strand_id` (`strand_id`);

--
-- Indexes for table `strands`
--
ALTER TABLE `strands`
  ADD PRIMARY KEY (`strand_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_teacher` (`teacher_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `strands`
--
ALTER TABLE `strands`
  MODIFY `strand_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`strand_id`) REFERENCES `strands` (`strand_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
