-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 04, 2026 at 04:16 AM
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
-- Database: `duelcode_capstone_project`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_sessions`
--

CREATE TABLE `active_sessions` (
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 7 day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_sessions`
--

INSERT INTO `active_sessions` (`session_id`, `user_id`, `token`, `created_at`, `expires_at`) VALUES
(233, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzQ5MjMyNzh9.Q2Mh4ZAaPSzIO_v_gCEojP336pt7zYpxHJpBgVZCTNw', '2026-03-31 02:14:38', '2026-04-07 02:14:38'),
(234, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzQ5MjMzMDd9.n7xlLsHy-6AqXh9imnbZHdxYeZnj8HETgdYARl2E3xo', '2026-03-31 02:15:07', '2026-04-07 02:15:07'),
(235, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzQ5MjMzMjd9.l5yfV6ntLRbaoF7g-HiwpLpsgPg63OqE2NihNjGIzz0', '2026-03-31 02:15:27', '2026-04-07 02:15:27'),
(238, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NDkyNjAzM30.OTJC3WThSZI9n2VPzPtR6uNLUHk62NNf_2StHG_hi-w', '2026-03-31 03:00:33', '2026-04-07 03:00:33'),
(239, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzUwNzQ4MDh9.Esgf2FizZXMzZ6C0kq61B7SAarKQcByXhIk-89L2__w', '2026-04-01 20:20:08', '2026-04-08 20:20:08'),
(240, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzUwOTU2ODZ9.vtPO5REinbuar9qW8mridRpe9vnHZPj2DHBS9TM0pRg', '2026-04-02 02:08:06', '2026-04-09 02:08:06'),
(241, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzUxMTk2ODZ9.MKxTqJWLzgpBhULXk2T2kMBiiqgAojMafybkEMI744A', '2026-04-02 08:48:06', '2026-04-09 08:48:06'),
(242, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzUxMzQxODF9.YTUerDuOqerfpQqeCTvWKlbTSBe4faxvVAKGQTxMtHY', '2026-04-02 12:49:41', '2026-04-09 12:49:41'),
(243, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzUxMzU4NDV9.2VopZ52I8aZb4OaxrRodzyyn9cI5v6MmFqA_Q0AORlQ', '2026-04-02 13:17:25', '2026-04-09 13:17:25'),
(244, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzUxMzU4NTF9.KU_bz9BK8L0AqGEWUk1Fhp3GkBjtApAghiKYcmuvxb0', '2026-04-02 13:17:31', '2026-04-09 13:17:31'),
(245, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NzUxMzU4NjB9.KGS-lGVuxcdXDdWb1lZiz1NrRzXcfGOQ_8kfAHqQ-0w', '2026-04-02 13:17:40', '2026-04-09 13:17:40'),
(246, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyMzc2NH0.QWkncs1RbSga_IuOUoiFrqiswQjnjJWZzakdpbe-iB0', '2026-04-03 13:42:44', '2026-04-10 13:42:44'),
(247, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyNTA0Mn0.T4joihb5YSL1Wyqls-ZyNsXlpa5ZWpyKwmxFN2dtUtY', '2026-04-03 14:04:02', '2026-04-10 14:04:02'),
(248, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyNTA4NH0.fRJbbYbq3NDWDhy9foZm2_vaGwGrauoHuQQgl5m6U_w', '2026-04-03 14:04:44', '2026-04-10 14:04:44'),
(249, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyNTg0OX0.wX-o3Kw6oKv9Jzxk9hlObWHsJBDFrNpw-HTuXU8r1-M', '2026-04-03 14:17:29', '2026-04-10 14:17:29'),
(250, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyNjQ3Nn0.jyobJM551n9VrnmERw_TMC0ZS1Ps9PKAM_--6FooJm0', '2026-04-03 14:27:56', '2026-04-10 14:27:56'),
(251, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyNzcxNX0.elGVBfrBjPBZhlYe8Ofhcpuheai-1yf6cD3CDf4bWC0', '2026-04-03 14:48:35', '2026-04-10 14:48:35'),
(252, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyODUxMn0.hi5OC_fwPra2v0ZCkZi6uzQR967xhMmd5oCLXZcpmGs', '2026-04-03 15:01:52', '2026-04-10 15:01:52'),
(253, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IiwiZW1haWwiOiJpc2p1ZHlvbnRoYXRjYXJnb2JveEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfNF8xNzY1Mjg4NzM2NjczLmpwZyIsImlhdCI6MTc3NTIyOTEzMH0.DsFpn97F6E-4x1E6y68KMXaOkqZHwAWHsH0cL13xRSk', '2026-04-03 15:12:10', '2026-04-10 15:12:10'),
(254, 21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEsInVzZXJuYW1lIjoiYWRtaW5fdGVzdCIsImVtYWlsIjoiYWRtaW5AZHVlbGNvZGUuY29tIiwicm9sZSI6MCwiaWF0IjoxNzc1MjU5Njk4fQ.bVmhNbly9utMr0sWq6S-k56Qd_no2e8S2b8usQmr9gw', '2026-04-03 23:41:38', '2026-04-10 23:41:38'),
(256, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IHlldCIsImVtYWlsIjoiaXNqdWR5b250aGF0Y2FyZ29ib3hAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyX3VybCI6ImFzc2V0L3Byb2ZpbGUvYXZhdGFyXzRfMTc2NTI4ODczNjY3My5qcGciLCJpYXQiOjE3NzUyNjI0MjF9.vTetfzRSgzFk4Gcw466fre-rOTiKqm2OzClYApiNL40', '2026-04-04 00:27:01', '2026-04-11 00:27:01'),
(257, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IHlldCIsImVtYWlsIjoiaXNqdWR5b250aGF0Y2FyZ29ib3hAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyX3VybCI6ImFzc2V0L3Byb2ZpbGUvYXZhdGFyXzRfMTc2NTI4ODczNjY3My5qcGciLCJpYXQiOjE3NzUyNjI0NTV9.-VyAGnj5-zW3UBgKY7tDR-rDX2-csO7aLwHu09JCUiA', '2026-04-04 00:27:35', '2026-04-11 00:27:35'),
(258, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IHlldCIsImVtYWlsIjoiaXNqdWR5b250aGF0Y2FyZ29ib3hAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyX3VybCI6ImFzc2V0L3Byb2ZpbGUvYXZhdGFyXzRfMTc2NTI4ODczNjY3My5qcGciLCJpYXQiOjE3NzUyNjI0OTh9.5CbHCq6Wwmp6G7HZkyNixInpgRm2DOubHpgVGtm1ZI8', '2026-04-04 00:28:18', '2026-04-11 00:28:18'),
(259, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IHlldCIsImVtYWlsIjoiaXNqdWR5b250aGF0Y2FyZ29ib3hAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyX3VybCI6ImFzc2V0L3Byb2ZpbGUvYXZhdGFyXzRfMTc2NTI4ODczNjY3My5qcGciLCJpYXQiOjE3NzUyNjM1NzV9.zHtXIl7n8NDDadOjDjPwwbo_RTSFr-e-_Pc9o4hU9Y4', '2026-04-04 00:46:15', '2026-04-11 00:46:15'),
(260, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IHlldCIsImVtYWlsIjoiaXNqdWR5b250aGF0Y2FyZ29ib3hAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyX3VybCI6ImFzc2V0L3Byb2ZpbGUvYXZhdGFyXzRfMTc2NTI4ODczNjY3My5qcGciLCJpYXQiOjE3NzUyNjQxMjV9.aLiPYzd-W0tKPXh0il42OGjznKfLAh3E32NgIGEjkVo', '2026-04-04 00:55:25', '2026-04-11 00:55:25'),
(261, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IHlldCIsImVtYWlsIjoiaXNqdWR5b250aGF0Y2FyZ29ib3hAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyX3VybCI6ImFzc2V0L3Byb2ZpbGUvYXZhdGFyXzRfMTc2NTI4ODczNjY3My5qcGciLCJpYXQiOjE3NzUyNjQyNzR9.ioiOhZVgQPGJQILRuwCgSSU4rN_M87_A5gI_SAHgk70', '2026-04-04 00:57:54', '2026-04-11 00:57:54'),
(262, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywidXNlcm5hbWUiOiJKYW1lcyBTdW5kZXJsYW5kIiwiZW1haWwiOiJqYW1lc3N1bmRlcmxhbmRAZ21haWwuY29tIiwicm9sZSI6ImZhY3VsdHkiLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfN18xNzY1Mjg5NzIyMjUyLmpwZyIsImlhdCI6MTc3NTI2NjgxNn0.6w6tI4V_w3KxxJwGxfkXO4y1juneLykSt5KjCUgpwQ8', '2026-04-04 01:40:16', '2026-04-11 01:40:16'),
(263, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywidXNlcm5hbWUiOiJKYW1lcyBTdW5kZXJsYW5kIiwiZW1haWwiOiJqYW1lc3N1bmRlcmxhbmRAZ21haWwuY29tIiwicm9sZSI6ImZhY3VsdHkiLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfN18xNzY1Mjg5NzIyMjUyLmpwZyIsImlhdCI6MTc3NTI2Njg0NX0.AI3SWxw_HOhMVatpuHN2CJVRFj3jwoTNPetANnvVFTI', '2026-04-04 01:40:45', '2026-04-11 01:40:45'),
(264, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJDYW50IFByb3ZlIGl0IHlldCIsImVtYWlsIjoiaXNqdWR5b250aGF0Y2FyZ29ib3hAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXZhdGFyX3VybCI6ImFzc2V0L3Byb2ZpbGUvYXZhdGFyXzRfMTc2NTI4ODczNjY3My5qcGciLCJpYXQiOjE3NzUyNjcyMDB9.bcBQnW3XQWeGwy53PtN2bGvbVI9J0UPimLfA5WDE3to', '2026-04-04 01:46:40', '2026-04-11 01:46:40'),
(265, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywidXNlcm5hbWUiOiJKYW1lcyBTdW5kZXJsYW5kIiwiZW1haWwiOiJqYW1lc3N1bmRlcmxhbmRAZ21haWwuY29tIiwicm9sZSI6ImZhY3VsdHkiLCJhdmF0YXJfdXJsIjoiYXNzZXQvcHJvZmlsZS9hdmF0YXJfN18xNzY1Mjg5NzIyMjUyLmpwZyIsImlhdCI6MTc3NTI2Nzk2Nn0.1gbHfSCndvm1YBhL8mmNorhwruityWfWK_woBb214Ks', '2026-04-04 01:59:26', '2026-04-11 01:59:26');

-- --------------------------------------------------------

--
-- Table structure for table `approvals`
--

CREATE TABLE `approvals` (
  `approval_id` int(11) NOT NULL,
  `content_item_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','denied','draft') DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvals`
--

INSERT INTO `approvals` (`approval_id`, `content_item_id`, `requested_by`, `approved_by`, `status`, `reason`, `created_at`, `updated_at`) VALUES
(22, 25, 3, NULL, 'pending', 'Awaiting review for blog post', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(23, 26, 4, NULL, 'pending', 'Awaiting review for blog post', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(24, 27, 7, NULL, 'pending', 'Awaiting review for blog post', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(25, 28, 3, NULL, 'pending', 'Event pending scheduling approval', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(26, 29, 4, NULL, 'pending', 'Event pending scheduling approval', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(27, 30, 7, NULL, 'pending', 'Event pending scheduling approval', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(28, 31, 3, NULL, 'pending', 'Problem awaiting test validation', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(29, 32, 4, NULL, 'pending', 'Problem awaiting test validation', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(30, 33, 7, NULL, 'pending', 'Problem awaiting test validation', '2025-12-10 11:40:04', '2025-12-10 11:40:04'),
(31, 50, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(32, 51, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(33, 52, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(34, 53, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(35, 54, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(36, 55, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(37, 56, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(38, 57, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(39, 58, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(40, 59, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(41, 60, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(42, 61, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(43, 62, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(44, 63, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(45, 64, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(46, 65, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(47, 66, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(48, 67, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(49, 68, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(50, 69, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(51, 70, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(52, 71, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23'),
(53, 72, 4, NULL, 'approved', NULL, '2026-04-04 00:54:23', '2026-04-04 00:54:23');

-- --------------------------------------------------------

--
-- Table structure for table `audit_trail`
--

CREATE TABLE `audit_trail` (
  `audit_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_trail`
--

INSERT INTO `audit_trail` (`audit_id`, `user_id`, `action`, `timestamp`) VALUES
(1, 3, 'anticheat_violation: {\"match_id\":257,\"reason\":\"⚠️ Pasting code is not allowed during a match!\"}', '2026-03-13 22:49:06'),
(2, 3, 'anticheat_violation: {\"match_id\":259,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-21 14:11:05'),
(3, 3, 'anticheat_violation: {\"match_id\":259,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-21 14:11:14'),
(4, 3, 'anticheat_violation: {\"match_id\":259,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-03-21 14:11:14'),
(5, 8, 'anticheat_violation: {\"match_id\":259,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-21 14:15:54'),
(6, 8, 'anticheat_violation: {\"match_id\":259,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-03-21 14:15:54'),
(7, 8, 'anticheat_violation: {\"match_id\":259,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-21 14:15:55'),
(8, 8, 'anticheat_violation: {\"match_id\":260,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-31 02:40:52'),
(9, 8, 'anticheat_violation: {\"match_id\":260,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-03-31 02:40:52'),
(10, 8, 'anticheat_violation: {\"match_id\":261,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-31 02:51:04'),
(11, 8, 'anticheat_violation: {\"match_id\":261,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-03-31 02:51:05'),
(12, 3, 'anticheat_violation: {\"match_id\":261,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-31 02:51:06'),
(13, 3, 'anticheat_violation: {\"match_id\":261,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-03-31 02:51:06'),
(14, 8, 'anticheat_violation: {\"match_id\":261,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-31 02:51:06'),
(15, 3, 'anticheat_violation: {\"match_id\":261,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-03-31 02:52:55'),
(16, 3, 'anticheat_violation: {\"match_id\":263,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 02:26:41'),
(17, 3, 'anticheat_violation: {\"match_id\":263,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 02:26:41'),
(18, 3, 'anticheat_violation: {\"match_id\":263,\"reason\":\"⚠️ Pasting code is not allowed during a match!\"}', '2026-04-02 02:27:09'),
(19, 8, 'anticheat_violation: {\"match_id\":264,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 02:41:45'),
(20, 8, 'anticheat_violation: {\"match_id\":264,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 02:42:22'),
(21, 8, 'anticheat_violation: {\"match_id\":264,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 02:42:23'),
(22, 3, 'anticheat_violation: {\"match_id\":265,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 02:43:25'),
(23, 3, 'anticheat_violation: {\"match_id\":265,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 02:43:25'),
(24, 3, 'anticheat_violation: {\"match_id\":265,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 02:43:27'),
(25, 8, 'anticheat_violation: {\"match_id\":266,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 02:50:03'),
(26, 8, 'anticheat_violation: {\"match_id\":266,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 02:50:04'),
(27, 8, 'anticheat_violation: {\"match_id\":266,\"reason\":\"⚠️ Pasting code is not allowed during a match!\"}', '2026-04-02 02:50:13'),
(28, 8, 'anticheat_violation: {\"match_id\":267,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 02:56:43'),
(29, 8, 'anticheat_violation: {\"match_id\":267,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 02:56:43'),
(30, 8, 'anticheat_violation: {\"match_id\":267,\"reason\":\"⚠️ Pasting code is not allowed during a match!\"}', '2026-04-02 02:56:57'),
(31, 3, 'anticheat_violation: {\"match_id\":267,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 03:17:26'),
(32, 3, 'anticheat_violation: {\"match_id\":267,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 03:17:26'),
(33, 3, 'anticheat_violation: {\"match_id\":267,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 03:17:28'),
(34, 3, 'anticheat_violation: {\"match_id\":267,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 03:17:28'),
(35, 3, 'anticheat_violation: {\"match_id\":268,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 03:18:23'),
(36, 3, 'anticheat_violation: {\"match_id\":268,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 03:18:23'),
(37, 3, 'anticheat_violation: {\"match_id\":268,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 03:18:39'),
(38, 3, 'anticheat_violation: {\"match_id\":270,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 03:26:35'),
(39, 3, 'anticheat_violation: {\"match_id\":270,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 03:26:35'),
(40, 8, 'anticheat_violation: {\"match_id\":271,\"reason\":\"⚠️ Pasting code is not allowed during a match!\"}', '2026-04-02 03:31:16'),
(41, 8, 'anticheat_violation: {\"match_id\":273,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 04:03:52'),
(42, 8, 'anticheat_violation: {\"match_id\":273,\"reason\":\"⚠️ Pasting code is not allowed during a match!\"}', '2026-04-02 04:04:06'),
(43, 3, 'anticheat_violation: {\"match_id\":277,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 08:51:52'),
(44, 8, 'anticheat_violation: {\"match_id\":277,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 08:51:54'),
(45, 3, 'anticheat_violation: {\"match_id\":278,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 12:49:56'),
(46, 8, 'anticheat_violation: {\"match_id\":278,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 12:49:58'),
(47, 3, 'anticheat_violation: {\"match_id\":278,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 12:52:43'),
(48, 3, 'anticheat_violation: {\"match_id\":280,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 13:23:40'),
(49, 3, 'anticheat_violation: {\"match_id\":280,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 13:23:41'),
(50, 3, 'anticheat_violation: {\"match_id\":280,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 13:23:41'),
(51, 3, 'anticheat_violation: {\"match_id\":281,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 13:27:38'),
(52, 8, 'anticheat_violation: {\"match_id\":281,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 13:27:41'),
(53, 8, 'anticheat_violation: {\"match_id\":287,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 13:50:12'),
(54, 3, 'anticheat_violation: {\"match_id\":287,\"reason\":\"⚠️ Tab switching is not allowed during a match!\"}', '2026-04-02 13:50:15'),
(55, 3, 'anticheat_violation: {\"match_id\":287,\"reason\":\"⚠️ Window focus lost! Stay on this tab during the match.\"}', '2026-04-02 13:51:57');

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `blog_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `published_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `status` enum('draft','pending_review','approved','rejected','published','archived') DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`blog_id`, `author_id`, `thumbnail_url`, `title`, `content`, `published_at`, `updated_at`, `status`) VALUES
(10, 3, 'asset/blogs/blog_user3_thumb.jpg', 'Optimizing Two-Sum Solutions', 'Deep dive into hash-map vs two-pointer approaches...', '2025-12-10 19:40:04', NULL, 'pending_review'),
(11, 4, 'asset/blogs/blog_user4_thumb.jpg', 'Dynamic Programming Patterns', 'Common DP techniques and when to use them...', '2025-12-10 19:40:04', NULL, 'pending_review'),
(12, 7, 'asset/blogs/blog_user7_thumb.jpg', 'Graph Algorithms Demystified', 'BFS, DFS, and shortest path algorithms explained...', '2025-12-10 19:40:04', NULL, 'pending_review');

-- --------------------------------------------------------

--
-- Table structure for table `blog_likes`
--

CREATE TABLE `blog_likes` (
  `like_id` int(11) NOT NULL,
  `blog_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `liked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `content_blogs`
--

CREATE TABLE `content_blogs` (
  `content_item_id` int(11) NOT NULL,
  `blog_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content_blogs`
--

INSERT INTO `content_blogs` (`content_item_id`, `blog_id`) VALUES
(25, 10),
(26, 11),
(27, 12);

-- --------------------------------------------------------

--
-- Table structure for table `content_events`
--

CREATE TABLE `content_events` (
  `content_item_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content_events`
--

INSERT INTO `content_events` (`content_item_id`, `event_id`) VALUES
(28, 10),
(29, 11),
(30, 12);

-- --------------------------------------------------------

--
-- Table structure for table `content_items`
--

CREATE TABLE `content_items` (
  `content_item_id` int(11) NOT NULL,
  `content_type` enum('event','blog','problem') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content_items`
--

INSERT INTO `content_items` (`content_item_id`, `content_type`, `created_at`) VALUES
(25, 'blog', '2025-12-10 11:40:04'),
(26, 'blog', '2025-12-10 11:40:04'),
(27, 'blog', '2025-12-10 11:40:04'),
(28, 'event', '2025-12-10 11:40:04'),
(29, 'event', '2025-12-10 11:40:04'),
(30, 'event', '2025-12-10 11:40:04'),
(50, 'problem', '2026-04-02 02:00:01'),
(51, 'problem', '2026-04-02 02:00:01'),
(52, 'problem', '2026-04-02 02:00:01'),
(53, 'problem', '2026-04-02 02:00:01'),
(54, 'problem', '2026-04-02 02:00:01'),
(55, 'problem', '2026-04-02 02:00:01'),
(56, 'problem', '2026-04-02 02:00:01'),
(57, 'problem', '2026-04-02 02:00:01'),
(58, 'problem', '2026-04-02 02:00:01'),
(59, 'problem', '2026-04-02 02:00:01'),
(60, 'problem', '2026-04-02 02:00:01'),
(61, 'problem', '2026-04-02 02:00:01'),
(62, 'problem', '2026-04-02 02:00:01'),
(63, 'problem', '2026-04-02 02:00:01'),
(64, 'problem', '2026-04-02 02:00:01'),
(65, 'problem', '2026-04-02 02:00:01'),
(66, 'problem', '2026-04-02 02:00:01'),
(67, 'problem', '2026-04-02 02:00:01'),
(68, 'problem', '2026-04-02 02:00:01'),
(69, 'problem', '2026-04-02 02:00:01'),
(70, 'problem', '2026-04-02 02:00:01'),
(71, 'problem', '2026-04-02 02:00:01'),
(72, 'problem', '2026-04-02 02:00:01');

-- --------------------------------------------------------

--
-- Table structure for table `content_problems`
--

CREATE TABLE `content_problems` (
  `content_item_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content_problems`
--

INSERT INTO `content_problems` (`content_item_id`, `problem_id`) VALUES
(50, 100),
(51, 101),
(52, 102),
(53, 103),
(54, 104),
(55, 105),
(56, 106),
(57, 107),
(58, 108),
(59, 109),
(60, 110),
(61, 111),
(62, 112),
(63, 113),
(64, 114),
(65, 115),
(66, 116),
(67, 117),
(68, 118),
(69, 119),
(70, 120),
(71, 121),
(72, 122);

-- --------------------------------------------------------

--
-- Table structure for table `duel_lobby_messages`
--

CREATE TABLE `duel_lobby_messages` (
  `message_id` int(11) NOT NULL,
  `lobby_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `duel_lobby_messages`
--

INSERT INTO `duel_lobby_messages` (`message_id`, `lobby_id`, `user_id`, `message`, `sent_at`) VALUES
(162, 105, 1, 'dwad', '2025-12-22 09:34:55'),
(163, 105, 1, 'wad', '2025-12-22 09:34:57'),
(164, 105, 1, 'dwad', '2025-12-22 09:34:58'),
(165, 105, 1, 'adw', '2025-12-22 09:34:58'),
(166, 105, 8, 'dwa', '2025-12-22 09:35:02'),
(167, 153, 3, 'fuckk yuu', '2025-12-30 08:48:38'),
(168, 153, 1, 'fuckkk yuu', '2025-12-30 08:48:45'),
(169, 153, 3, 'wahtt yourrr namee??', '2025-12-30 08:48:55'),
(170, 153, 1, 'wwhhatt?', '2025-12-30 08:49:02'),
(171, 153, 3, 'what is your nAMEEEE?', '2025-12-30 08:49:13'),
(172, 153, 1, 'ezickle', '2025-12-30 08:49:33'),
(173, 153, 3, 'FUKK YUU EZICKLEE', '2025-12-30 08:49:46'),
(0, 182, 3, 'hey', '2026-03-13 20:54:09'),
(0, 182, 3, 'that cheating', '2026-03-13 20:54:16'),
(0, 189, 20, 'hi', '2026-03-13 22:07:24');

-- --------------------------------------------------------

--
-- Table structure for table `duel_lobby_players`
--

CREATE TABLE `duel_lobby_players` (
  `lobby_player_id` int(11) NOT NULL,
  `lobby_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_ready` tinyint(1) NOT NULL DEFAULT 0,
  `score` int(11) DEFAULT NULL COMMENT 'Player score percentage (0-100)',
  `completion_time` int(11) DEFAULT NULL COMMENT 'Time taken to complete in seconds',
  `verdict` varchar(50) DEFAULT NULL COMMENT 'Judge verdict',
  `left_at` timestamp NULL DEFAULT NULL,
  `round_number` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `duel_lobby_players`
--

INSERT INTO `duel_lobby_players` (`lobby_player_id`, `lobby_id`, `user_id`, `joined_at`, `is_ready`, `score`, `completion_time`, `verdict`, `left_at`, `round_number`) VALUES
(117, 76, 3, '2025-12-21 01:10:45', 1, NULL, NULL, NULL, '2025-12-21 02:06:07', 0),
(118, 76, 1, '2025-12-21 01:10:55', 1, NULL, NULL, NULL, NULL, 0),
(165, 97, 3, '2025-12-21 22:04:52', 1, NULL, NULL, NULL, '2025-12-21 22:08:43', 0),
(166, 97, 8, '2025-12-21 22:04:59', 1, NULL, NULL, NULL, '2025-12-21 22:05:51', 0),
(168, 97, 1, '2025-12-21 22:08:22', 1, NULL, NULL, NULL, '2025-12-21 22:08:24', 0),
(172, 103, 3, '2025-12-22 07:53:11', 1, NULL, NULL, NULL, '2025-12-22 07:54:51', 0),
(173, 103, 8, '2025-12-22 07:54:26', 1, NULL, NULL, NULL, '2025-12-22 07:54:54', 0),
(176, 104, 3, '2025-12-22 08:22:24', 1, NULL, NULL, NULL, '2025-12-22 08:27:42', 0),
(177, 104, 8, '2025-12-22 08:22:51', 1, NULL, NULL, NULL, '2025-12-22 08:27:41', 0),
(179, 105, 1, '2025-12-22 09:33:27', 1, NULL, NULL, NULL, '2025-12-22 09:36:52', 0),
(180, 105, 3, '2025-12-22 09:34:36', 1, NULL, NULL, NULL, '2025-12-22 09:37:01', 0),
(182, 106, 8, '2025-12-22 09:50:44', 1, NULL, NULL, NULL, '2025-12-22 09:53:44', 0),
(183, 106, 3, '2025-12-22 09:50:48', 1, NULL, NULL, NULL, '2025-12-22 09:53:41', 0),
(188, 107, 3, '2025-12-22 10:20:38', 1, NULL, NULL, NULL, '2025-12-22 10:23:21', 0),
(189, 107, 8, '2025-12-22 10:20:41', 1, NULL, NULL, NULL, '2025-12-22 10:23:19', 0),
(193, 108, 3, '2025-12-27 12:49:58', 1, NULL, NULL, NULL, '2025-12-27 12:55:04', 0),
(194, 108, 8, '2025-12-27 12:54:30', 1, NULL, NULL, NULL, '2025-12-27 12:55:05', 0),
(196, 109, 3, '2025-12-27 13:28:22', 1, NULL, NULL, NULL, '2025-12-27 13:29:19', 0),
(197, 109, 8, '2025-12-27 13:28:42', 1, NULL, NULL, NULL, '2025-12-27 13:29:15', 0),
(199, 110, 3, '2025-12-27 13:43:34', 1, NULL, NULL, NULL, '2025-12-27 13:44:09', 0),
(200, 110, 1, '2025-12-27 13:43:40', 1, NULL, NULL, NULL, NULL, 0),
(202, 111, 1, '2025-12-27 14:08:46', 1, NULL, NULL, NULL, '2025-12-27 14:09:42', 0),
(203, 111, 8, '2025-12-27 14:08:48', 1, NULL, NULL, NULL, '2025-12-27 14:09:45', 0),
(204, 111, 3, '2025-12-27 14:18:43', 1, NULL, NULL, NULL, '2025-12-27 14:18:57', 0),
(206, 112, 1, '2025-12-27 14:21:53', 1, NULL, NULL, NULL, '2025-12-27 14:23:07', 0),
(207, 112, 8, '2025-12-27 14:21:53', 1, NULL, NULL, NULL, '2025-12-27 14:23:09', 0),
(212, 114, 3, '2025-12-27 15:08:55', 1, NULL, NULL, NULL, '2025-12-27 15:41:50', 0),
(213, 114, 8, '2025-12-27 15:09:03', 1, NULL, NULL, NULL, '2025-12-27 15:41:51', 0),
(217, 115, 8, '2025-12-27 20:40:47', 1, NULL, NULL, NULL, '2025-12-27 20:43:40', 0),
(218, 115, 3, '2025-12-27 20:40:49', 1, NULL, NULL, NULL, '2025-12-27 20:43:39', 0),
(225, 117, 8, '2025-12-27 21:40:59', 1, NULL, NULL, NULL, '2025-12-27 21:42:54', 0),
(226, 117, 3, '2025-12-27 21:41:03', 1, NULL, NULL, NULL, '2025-12-27 21:42:52', 0),
(230, 118, 3, '2025-12-27 22:03:57', 1, NULL, NULL, NULL, '2025-12-27 22:18:17', 0),
(231, 118, 8, '2025-12-27 22:04:18', 1, NULL, NULL, NULL, '2025-12-27 22:18:12', 0),
(234, 118, 1, '2025-12-27 22:23:43', 1, NULL, NULL, NULL, '2025-12-27 22:24:01', 0),
(236, 119, 8, '2025-12-27 22:27:30', 1, NULL, NULL, NULL, '2025-12-27 22:28:20', 0),
(237, 119, 3, '2025-12-27 22:27:42', 1, NULL, NULL, NULL, '2025-12-27 22:28:17', 0),
(243, 121, 3, '2025-12-27 23:52:09', 1, NULL, NULL, NULL, '2025-12-28 00:06:02', 0),
(244, 121, 8, '2025-12-27 23:56:58', 1, NULL, NULL, NULL, '2025-12-28 00:06:03', 0),
(247, 121, 1, '2025-12-28 00:05:53', 1, NULL, NULL, NULL, '2025-12-28 00:06:07', 0),
(252, 122, 8, '2025-12-28 01:24:22', 1, NULL, NULL, NULL, '2025-12-28 01:29:12', 0),
(253, 122, 3, '2025-12-28 01:28:17', 1, NULL, NULL, NULL, '2025-12-28 01:29:09', 0),
(257, 123, 3, '2025-12-29 02:46:29', 1, NULL, NULL, NULL, '2025-12-29 03:14:05', 0),
(258, 123, 8, '2025-12-29 02:48:51', 1, NULL, NULL, NULL, '2025-12-29 03:13:50', 0),
(263, 126, 1, '2025-12-29 06:03:11', 1, NULL, NULL, NULL, '2025-12-29 06:12:57', 0),
(264, 126, 8, '2025-12-29 06:03:44', 1, NULL, NULL, NULL, '2025-12-29 06:40:05', 0),
(265, 126, 3, '2025-12-29 06:04:46', 1, NULL, NULL, NULL, '2025-12-29 06:36:51', 0),
(270, 127, 3, '2025-12-29 07:04:26', 1, NULL, NULL, NULL, '2025-12-29 07:06:06', 0),
(271, 127, 8, '2025-12-29 07:04:31', 1, NULL, NULL, NULL, '2025-12-29 07:06:00', 0),
(275, 128, 1, '2025-12-29 07:46:36', 1, NULL, NULL, NULL, NULL, 0),
(276, 128, 8, '2025-12-29 07:47:28', 1, NULL, NULL, NULL, '2025-12-29 07:49:35', 0),
(285, 132, 3, '2025-12-30 00:57:03', 1, NULL, NULL, NULL, '2025-12-30 00:59:17', 0),
(286, 132, 8, '2025-12-30 00:57:04', 1, NULL, NULL, NULL, '2025-12-30 00:59:13', 0),
(289, 132, 1, '2025-12-30 01:20:38', 1, NULL, NULL, NULL, NULL, 0),
(291, 133, 3, '2025-12-30 01:59:28', 1, NULL, NULL, NULL, '2025-12-30 02:13:20', 0),
(292, 133, 8, '2025-12-30 02:03:31', 1, NULL, NULL, NULL, '2025-12-30 02:13:20', 0),
(298, 134, 3, '2025-12-30 02:21:05', 1, NULL, NULL, NULL, NULL, 0),
(299, 134, 8, '2025-12-30 02:21:15', 1, NULL, NULL, NULL, NULL, 0),
(301, 136, 8, '2025-12-30 02:34:22', 1, NULL, NULL, NULL, '2025-12-30 02:40:28', 0),
(302, 136, 3, '2025-12-30 02:35:46', 1, NULL, NULL, NULL, '2025-12-30 02:40:32', 0),
(303, 137, 3, '2025-12-30 02:45:23', 1, NULL, NULL, NULL, '2025-12-30 03:01:01', 0),
(304, 137, 1, '2025-12-30 02:45:54', 1, NULL, NULL, NULL, '2025-12-30 03:00:48', 0),
(314, 139, 3, '2025-12-30 03:49:19', 1, NULL, NULL, NULL, '2025-12-30 03:51:20', 0),
(315, 139, 8, '2025-12-30 03:49:21', 1, NULL, NULL, NULL, '2025-12-30 03:51:20', 0),
(317, 140, 8, '2025-12-30 04:27:08', 1, NULL, NULL, NULL, '2025-12-30 04:29:21', 0),
(318, 140, 3, '2025-12-30 04:27:49', 1, NULL, NULL, NULL, '2025-12-30 04:29:27', 0),
(322, 141, 3, '2025-12-30 05:04:48', 1, NULL, NULL, NULL, '2025-12-30 05:12:10', 0),
(323, 141, 8, '2025-12-30 05:05:46', 1, NULL, NULL, NULL, '2025-12-30 05:12:19', 0),
(330, 143, 8, '2025-12-30 06:16:29', 1, NULL, NULL, NULL, '2025-12-30 06:18:33', 0),
(331, 143, 3, '2025-12-30 06:16:37', 1, NULL, NULL, NULL, '2025-12-30 06:18:17', 0),
(333, 145, 8, '2025-12-30 06:28:33', 1, NULL, NULL, NULL, '2025-12-30 06:30:54', 0),
(334, 145, 3, '2025-12-30 06:28:35', 1, NULL, NULL, NULL, '2025-12-30 06:30:50', 0),
(336, 146, 3, '2025-12-30 06:55:49', 1, NULL, NULL, NULL, '2025-12-30 06:59:42', 0),
(337, 146, 8, '2025-12-30 06:55:51', 1, NULL, NULL, NULL, '2025-12-30 06:59:42', 0),
(339, 147, 8, '2025-12-30 07:14:29', 1, NULL, NULL, NULL, '2025-12-30 07:18:58', 0),
(340, 147, 3, '2025-12-30 07:14:35', 1, NULL, NULL, NULL, '2025-12-30 07:18:58', 0),
(342, 148, 1, '2025-12-30 07:29:31', 1, NULL, NULL, NULL, '2025-12-30 07:42:04', 0),
(343, 148, 8, '2025-12-30 07:31:59', 1, NULL, NULL, NULL, '2025-12-30 07:42:11', 0),
(346, 149, 3, '2025-12-30 07:55:57', 1, NULL, NULL, NULL, '2025-12-30 07:59:44', 0),
(347, 149, 1, '2025-12-30 07:57:10', 1, NULL, NULL, NULL, '2025-12-30 07:59:41', 0),
(349, 150, 1, '2025-12-30 08:13:49', 1, NULL, NULL, NULL, '2025-12-30 08:17:33', 0),
(350, 150, 3, '2025-12-30 08:14:45', 1, NULL, NULL, NULL, '2025-12-30 08:17:33', 0),
(351, 151, 1, '2025-12-30 08:25:51', 1, NULL, NULL, NULL, '2025-12-30 08:27:16', 0),
(352, 151, 3, '2025-12-30 08:26:28', 1, NULL, NULL, NULL, '2025-12-30 08:27:17', 0),
(353, 152, 1, '2025-12-30 08:36:52', 1, NULL, NULL, NULL, '2025-12-30 08:39:30', 0),
(354, 152, 3, '2025-12-30 08:37:43', 1, NULL, NULL, NULL, '2025-12-30 08:39:30', 0),
(357, 153, 3, '2025-12-30 08:46:19', 1, NULL, NULL, NULL, '2025-12-30 08:50:01', 0),
(358, 153, 1, '2025-12-30 08:46:34', 1, NULL, NULL, NULL, '2025-12-30 08:50:04', 0),
(361, 154, 3, '2025-12-30 08:51:57', 1, NULL, NULL, NULL, '2025-12-30 08:52:23', 0),
(362, 154, 1, '2025-12-30 08:52:06', 1, NULL, NULL, NULL, '2025-12-30 08:56:15', 0),
(366, 155, 1, '2025-12-30 10:17:12', 1, NULL, NULL, NULL, '2025-12-30 11:16:36', 0),
(367, 155, 3, '2025-12-30 10:17:34', 1, NULL, NULL, NULL, '2025-12-30 11:16:35', 0),
(378, 156, 3, '2025-12-30 11:18:38', 1, NULL, NULL, NULL, '2025-12-30 11:19:04', 0),
(379, 156, 1, '2025-12-30 11:18:48', 1, NULL, NULL, NULL, '2025-12-30 11:19:02', 0),
(395, 163, 1, '2025-12-30 15:39:46', 1, NULL, NULL, NULL, '2025-12-30 15:44:36', 0),
(396, 163, 3, '2025-12-30 15:39:58', 1, NULL, NULL, NULL, '2025-12-30 15:44:24', 0),
(399, 164, 1, '2025-12-30 15:54:51', 1, NULL, NULL, NULL, '2025-12-30 15:57:12', 0),
(400, 164, 3, '2025-12-30 15:55:12', 1, NULL, NULL, NULL, '2025-12-30 15:57:03', 0),
(0, 0, 3, '2026-03-13 11:37:36', 1, NULL, NULL, NULL, '2026-03-13 11:41:41', 0),
(0, 0, 8, '2026-03-13 11:37:52', 1, NULL, NULL, NULL, '2026-03-13 11:38:05', 0),
(0, 0, 8, '2026-03-13 11:38:00', 1, NULL, NULL, NULL, '2026-03-13 11:38:05', 0),
(0, 0, 8, '2026-03-13 11:38:14', 1, NULL, NULL, NULL, NULL, 0),
(0, 0, 20, '2026-03-13 11:39:39', 1, NULL, NULL, NULL, NULL, 0),
(0, 166, 3, '2026-03-13 11:57:04', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 20, '2026-03-13 11:57:08', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 8, '2026-03-13 12:04:38', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 3, '2026-03-13 12:05:13', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 20, '2026-03-13 12:05:33', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 8, '2026-03-13 12:06:17', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 8, '2026-03-13 12:18:21', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 3, '2026-03-13 12:18:30', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 20, '2026-03-13 12:18:34', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 3, '2026-03-13 12:19:29', 1, NULL, NULL, NULL, '2026-03-13 12:20:40', 0),
(0, 166, 3, '2026-03-13 12:20:55', 1, NULL, NULL, NULL, NULL, 0),
(0, 166, 20, '2026-03-13 12:21:06', 0, NULL, NULL, NULL, NULL, 0),
(0, 166, 8, '2026-03-13 12:21:15', 0, NULL, NULL, NULL, NULL, 0),
(0, 167, 3, '2026-03-13 12:47:34', 1, NULL, NULL, NULL, '2026-03-13 12:52:48', 0),
(0, 167, 8, '2026-03-13 12:47:37', 0, NULL, NULL, NULL, '2026-03-13 12:52:55', 0),
(0, 167, 20, '2026-03-13 12:47:41', 0, NULL, NULL, NULL, '2026-03-13 12:52:59', 0),
(0, 167, 3, '2026-03-13 12:47:44', 1, 23, 2147483647, 'Wrong Answer (3/13)', '2026-03-13 12:52:48', 1),
(0, 167, 8, '2026-03-13 12:47:44', 0, 8, 2147483647, 'Wrong Answer (1/13)', '2026-03-13 12:52:55', 1),
(0, 167, 20, '2026-03-13 12:47:44', 0, 15, 2147483647, 'Wrong Answer (2/13)', '2026-03-13 12:52:59', 1),
(0, 168, 20, '2026-03-13 12:53:08', 0, NULL, NULL, NULL, NULL, 0),
(0, 168, 8, '2026-03-13 12:53:12', 0, NULL, NULL, NULL, NULL, 0),
(0, 168, 3, '2026-03-13 12:53:18', 1, NULL, NULL, NULL, NULL, 0),
(0, 168, 20, '2026-03-13 12:53:33', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 168, 8, '2026-03-13 12:53:33', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 168, 3, '2026-03-13 12:53:33', 1, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 168, 3, '2026-03-13 12:55:59', 1, 23, 2147483647, 'Wrong Answer (3/13)', NULL, 2),
(0, 168, 20, '2026-03-13 12:55:59', 0, 31, 2147483647, 'Wrong Answer (4/13)', NULL, 2),
(0, 168, 8, '2026-03-13 12:55:59', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 169, 3, '2026-03-13 13:02:03', 1, NULL, NULL, NULL, NULL, 0),
(0, 169, 20, '2026-03-13 13:02:08', 0, NULL, NULL, NULL, NULL, 0),
(0, 169, 8, '2026-03-13 13:02:11', 0, NULL, NULL, NULL, NULL, 0),
(0, 169, 3, '2026-03-13 13:02:15', 1, 23, 2147483647, 'Wrong Answer (3/13)', NULL, 1),
(0, 169, 20, '2026-03-13 13:02:15', 0, 31, 2147483647, 'Wrong Answer (4/13)', NULL, 1),
(0, 169, 8, '2026-03-13 13:02:15', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 169, 3, '2026-03-13 13:03:18', 1, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 169, 20, '2026-03-13 13:03:18', 0, 100, 2147483647, 'Accepted (13/13)', NULL, 2),
(0, 169, 8, '2026-03-13 13:03:18', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 170, 3, '2026-03-13 13:19:01', 1, NULL, NULL, NULL, NULL, 0),
(0, 170, 20, '2026-03-13 13:19:10', 1, NULL, NULL, NULL, NULL, 0),
(0, 170, 8, '2026-03-13 13:19:14', 1, NULL, NULL, NULL, NULL, 0),
(0, 170, 3, '2026-03-13 13:19:18', 1, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 170, 20, '2026-03-13 13:19:18', 1, 15, 2147483647, 'Wrong Answer (2/13)', NULL, 1),
(0, 170, 8, '2026-03-13 13:19:18', 1, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 170, 3, '2026-03-13 13:20:12', 1, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 170, 8, '2026-03-13 13:20:12', 1, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 170, 20, '2026-03-13 13:20:12', 1, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 171, 3, '2026-03-13 13:30:10', 1, NULL, NULL, NULL, '2026-03-13 13:30:30', 0),
(0, 171, 8, '2026-03-13 13:30:22', 1, NULL, NULL, NULL, '2026-03-13 13:30:30', 0),
(0, 171, 20, '2026-03-13 13:30:25', 1, NULL, NULL, NULL, '2026-03-13 13:30:30', 0),
(0, 171, 3, '2026-03-13 13:30:44', 1, NULL, NULL, NULL, NULL, 0),
(0, 171, 8, '2026-03-13 13:31:13', 0, NULL, NULL, NULL, NULL, 0),
(0, 171, 20, '2026-03-13 13:31:22', 1, NULL, NULL, NULL, NULL, 0),
(0, 172, 3, '2026-03-13 13:35:28', 1, NULL, NULL, NULL, '2026-03-13 13:35:42', 0),
(0, 172, 20, '2026-03-13 13:35:30', 1, NULL, NULL, NULL, '2026-03-13 13:35:42', 0),
(0, 172, 8, '2026-03-13 13:35:34', 1, NULL, NULL, NULL, '2026-03-13 13:35:42', 0),
(0, 172, 3, '2026-03-13 13:35:58', 1, NULL, NULL, NULL, NULL, 0),
(0, 172, 20, '2026-03-13 13:36:09', 0, NULL, NULL, NULL, NULL, 0),
(0, 172, 8, '2026-03-13 13:36:17', 0, NULL, NULL, NULL, NULL, 0),
(0, 173, 3, '2026-03-13 13:39:10', 1, NULL, NULL, NULL, NULL, 0),
(0, 173, 8, '2026-03-13 13:39:22', 0, NULL, NULL, NULL, NULL, 0),
(0, 173, 20, '2026-03-13 13:39:42', 0, NULL, NULL, NULL, NULL, 0),
(0, 176, 3, '2026-03-13 13:50:12', 1, NULL, NULL, NULL, NULL, 0),
(0, 176, 8, '2026-03-13 13:50:23', 0, NULL, NULL, NULL, NULL, 0),
(0, 176, 20, '2026-03-13 13:50:31', 0, NULL, NULL, NULL, NULL, 0),
(0, 177, 3, '2026-03-13 13:56:29', 1, NULL, NULL, NULL, NULL, 0),
(0, 177, 8, '2026-03-13 13:56:36', 0, NULL, NULL, NULL, NULL, 0),
(0, 177, 20, '2026-03-13 13:56:42', 0, NULL, NULL, NULL, NULL, 0),
(0, 178, 20, '2026-03-13 16:49:23', 0, NULL, NULL, NULL, NULL, 0),
(0, 178, 8, '2026-03-13 16:50:07', 0, NULL, NULL, NULL, NULL, 0),
(0, 178, 20, '2026-03-13 16:50:18', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 178, 8, '2026-03-13 16:50:18', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 178, 20, '2026-03-13 16:51:18', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 178, 8, '2026-03-13 16:51:18', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 178, 8, '2026-03-13 16:52:16', 0, 100, 2147483647, 'Accepted (13/13)', NULL, 3),
(0, 178, 20, '2026-03-13 16:52:16', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 3),
(0, 178, 8, '2026-03-13 16:53:45', 0, 15, 2147483647, 'Wrong Answer (2/13)', NULL, 4),
(0, 178, 20, '2026-03-13 16:53:45', 0, 100, 2147483647, 'Accepted (13/13)', NULL, 4),
(0, 178, 20, '2026-03-13 16:56:26', 0, 23, 2147483647, 'Wrong Answer (3/13)', NULL, 5),
(0, 178, 8, '2026-03-13 16:56:26', 0, 100, 2147483647, 'Accepted (13/13)', NULL, 5),
(0, 179, 20, '2026-03-13 17:10:18', 0, NULL, NULL, NULL, NULL, 0),
(0, 179, 8, '2026-03-13 17:10:23', 0, NULL, NULL, NULL, NULL, 0),
(0, 179, 20, '2026-03-13 17:10:38', 0, NULL, NULL, NULL, NULL, 1),
(0, 179, 8, '2026-03-13 17:10:38', 0, NULL, NULL, NULL, NULL, 1),
(0, 180, 20, '2026-03-13 20:31:45', 1, NULL, NULL, NULL, NULL, 0),
(0, 180, 8, '2026-03-13 20:31:50', 1, NULL, NULL, NULL, NULL, 0),
(0, 180, 20, '2026-03-13 20:32:24', 1, NULL, NULL, NULL, NULL, 1),
(0, 180, 8, '2026-03-13 20:32:24', 1, NULL, NULL, NULL, NULL, 1),
(0, 181, 20, '2026-03-13 20:46:23', 0, NULL, NULL, NULL, NULL, 0),
(0, 181, 8, '2026-03-13 20:46:24', 0, NULL, NULL, NULL, NULL, 0),
(0, 181, 20, '2026-03-13 20:46:34', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 181, 8, '2026-03-13 20:46:34', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 1),
(0, 181, 20, '2026-03-13 20:47:47', 0, 58, 2147483647, 'Wrong Answer (15/26)', NULL, 2),
(0, 181, 8, '2026-03-13 20:47:47', 0, 100, 2147483647, 'Accepted (26/26)', NULL, 2),
(0, 182, 8, '2026-03-13 20:52:59', 1, NULL, NULL, NULL, NULL, 0),
(0, 182, 3, '2026-03-13 20:53:01', 1, NULL, NULL, NULL, NULL, 0),
(0, 182, 8, '2026-03-13 20:53:21', 1, 100, 2147483647, 'Accepted (13/13)', NULL, 1),
(0, 182, 3, '2026-03-13 20:53:21', 1, 23, 2147483647, 'Wrong Answer (3/13)', NULL, 1),
(0, 184, 8, '2026-03-13 20:59:30', 1, NULL, NULL, NULL, NULL, 0),
(0, 184, 20, '2026-03-13 20:59:51', 1, NULL, NULL, NULL, NULL, 0),
(0, 184, 8, '2026-03-13 21:00:02', 1, NULL, NULL, NULL, NULL, 1),
(0, 184, 20, '2026-03-13 21:00:02', 1, NULL, NULL, NULL, NULL, 1),
(0, 185, 8, '2026-03-13 21:02:29', 1, NULL, NULL, NULL, NULL, 0),
(0, 185, 20, '2026-03-13 21:02:32', 1, NULL, NULL, NULL, NULL, 0),
(0, 185, 8, '2026-03-13 21:02:44', 1, 100, 2147483647, 'Accepted (13/13)', NULL, 1),
(0, 185, 20, '2026-03-13 21:02:44', 1, 100, 2147483647, 'Accepted (13/13)', NULL, 1),
(0, 185, 20, '2026-03-13 21:04:11', 1, 100, 2147483647, 'Accepted (13/13)', NULL, 2),
(0, 185, 8, '2026-03-13 21:04:11', 1, 15, 2147483647, 'Wrong Answer (2/13)', NULL, 2),
(0, 186, 8, '2026-03-13 21:12:28', 1, NULL, NULL, NULL, NULL, 0),
(0, 186, 20, '2026-03-13 21:12:31', 1, NULL, NULL, NULL, NULL, 0),
(0, 186, 8, '2026-03-13 21:12:44', 1, 100, 2147483647, 'Accepted (13/13)', NULL, 1),
(0, 186, 20, '2026-03-13 21:12:44', 1, 77, 2147483647, 'Wrong Answer (10/13)', NULL, 1),
(0, 186, 8, '2026-03-13 21:13:37', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 2),
(0, 186, 20, '2026-03-13 21:13:37', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 2),
(0, 186, 20, '2026-03-13 21:14:54', 1, NULL, NULL, NULL, NULL, 3),
(0, 186, 8, '2026-03-13 21:14:54', 1, NULL, NULL, NULL, NULL, 3),
(0, 187, 20, '2026-03-13 21:35:25', 1, NULL, NULL, NULL, NULL, 0),
(0, 187, 8, '2026-03-13 21:35:27', 1, NULL, NULL, NULL, NULL, 0),
(0, 187, 20, '2026-03-13 21:35:40', 1, 31, 2147483647, 'Wrong Answer (4/13)', NULL, 1),
(0, 187, 8, '2026-03-13 21:35:40', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 1),
(0, 187, 20, '2026-03-13 21:38:21', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 2),
(0, 187, 8, '2026-03-13 21:38:21', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 2),
(0, 187, 20, '2026-03-13 21:39:15', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 3),
(0, 187, 8, '2026-03-13 21:39:15', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 3),
(0, 187, 20, '2026-03-13 21:39:49', 1, NULL, NULL, NULL, NULL, 4),
(0, 187, 8, '2026-03-13 21:39:49', 1, NULL, NULL, NULL, NULL, 4),
(0, 187, 8, '2026-03-13 21:45:31', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 5),
(0, 187, 20, '2026-03-13 21:45:31', 1, 15, 2147483647, 'Wrong Answer (2/13)', NULL, 5),
(0, 187, 20, '2026-03-13 21:47:17', 1, 23, 2147483647, 'Wrong Answer (3/13)', NULL, 6),
(0, 187, 8, '2026-03-13 21:47:17', 1, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 6),
(0, 187, 8, '2026-03-13 21:48:49', 1, NULL, NULL, NULL, NULL, 7),
(0, 187, 20, '2026-03-13 21:48:49', 1, NULL, NULL, NULL, NULL, 7),
(0, 188, 8, '2026-03-13 21:53:34', 0, NULL, NULL, NULL, NULL, 0),
(0, 188, 20, '2026-03-13 21:53:36', 0, NULL, NULL, NULL, NULL, 0),
(0, 188, 8, '2026-03-13 21:54:01', 0, 38, 2147483647, 'Wrong Answer (5/13)', NULL, 1),
(0, 188, 20, '2026-03-13 21:54:01', 0, 15, 2147483647, 'Wrong Answer (2/13)', NULL, 1),
(0, 188, 20, '2026-03-13 21:55:07', 0, 0, 2147483647, 'Wrong Answer (0/26)', NULL, 2),
(0, 188, 8, '2026-03-13 21:55:07', 0, 58, 2147483647, 'Wrong Answer (15/26)', NULL, 2),
(0, 188, 20, '2026-03-13 21:56:32', 0, 0, 2147483647, 'Wrong Answer (0/26)', NULL, 3),
(0, 188, 8, '2026-03-13 21:56:32', 0, 0, 2147483647, 'Wrong Answer (0/26)', NULL, 3),
(0, 189, 20, '2026-03-13 22:07:17', 0, NULL, NULL, NULL, NULL, 0),
(0, 189, 8, '2026-03-13 22:07:19', 0, NULL, NULL, NULL, NULL, 0),
(0, 189, 20, '2026-03-13 22:07:39', 0, 58, 2147483647, 'Wrong Answer (15/26)', NULL, 1),
(0, 189, 8, '2026-03-13 22:07:39', 0, 42, 2147483647, 'Wrong Answer (11/26)', NULL, 1),
(0, 189, 20, '2026-03-13 22:09:09', 0, 15, 2147483647, 'Wrong Answer (2/13)', NULL, 2),
(0, 189, 8, '2026-03-13 22:09:09', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 2),
(0, 189, 8, '2026-03-13 22:11:00', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 3),
(0, 189, 20, '2026-03-13 22:11:00', 0, 8, 2147483647, 'Wrong Answer (1/13)', NULL, 3),
(0, 190, 20, '2026-03-13 22:21:45', 1, NULL, NULL, NULL, NULL, 0),
(0, 190, 8, '2026-03-13 22:21:52', 1, NULL, NULL, NULL, NULL, 0),
(0, 190, 20, '2026-03-13 22:22:20', 1, 58, 2147483647, 'Wrong Answer (15/26)', NULL, 1),
(0, 190, 8, '2026-03-13 22:22:20', 1, 42, 2147483647, 'Wrong Answer (11/26)', NULL, 1),
(0, 190, 20, '2026-03-13 22:23:39', 1, 38, 2147483647, 'Wrong Answer (5/13)', NULL, 2),
(0, 190, 8, '2026-03-13 22:23:39', 1, 23, 2147483647, 'Wrong Answer (3/13)', NULL, 2),
(0, 190, 20, '2026-03-13 22:24:53', 1, 92, 2147483647, 'Wrong Answer (12/13)', NULL, 3),
(0, 190, 8, '2026-03-13 22:24:53', 1, 54, 2147483647, 'Wrong Answer (7/13)', NULL, 3),
(0, 191, 20, '2026-03-13 22:39:29', 0, NULL, NULL, NULL, NULL, 0),
(0, 191, 8, '2026-03-13 22:39:35', 0, NULL, NULL, NULL, '2026-03-13 22:48:33', 0),
(0, 191, 20, '2026-03-13 22:43:14', 0, 100, 2147483647, 'Accepted (13/13)', NULL, 1),
(0, 191, 8, '2026-03-13 22:43:14', 0, 15, 2147483647, 'Wrong Answer (2/13)', '2026-03-13 22:48:33', 1),
(0, 191, 20, '2026-03-13 22:44:25', 0, 100, 2147483647, 'Accepted (13/13)', NULL, 2),
(0, 191, 8, '2026-03-13 22:44:25', 0, 85, 2147483647, 'Wrong Answer (11/13)', '2026-03-13 22:48:33', 2),
(0, 191, 20, '2026-03-13 22:45:23', 0, 77, 2147483647, 'Wrong Answer (10/13)', NULL, 3),
(0, 191, 8, '2026-03-13 22:45:23', 0, 100, 2147483647, 'Accepted (13/13)', '2026-03-13 22:48:33', 3),
(0, 196, 8, '2026-03-21 14:16:10', 1, NULL, NULL, NULL, NULL, 0),
(0, 196, 3, '2026-03-21 14:16:15', 0, NULL, NULL, NULL, '2026-03-21 14:17:13', 0),
(0, 196, 8, '2026-03-21 14:16:18', 1, NULL, NULL, NULL, NULL, 1),
(0, 196, 3, '2026-03-21 14:16:18', 0, NULL, NULL, NULL, '2026-03-21 14:17:13', 1),
(0, 197, 8, '2026-03-31 02:54:55', 0, NULL, NULL, NULL, NULL, 0),
(0, 197, 20, '2026-03-31 02:55:27', 0, NULL, NULL, NULL, '2026-03-31 02:57:31', 0),
(0, 197, 8, '2026-03-31 02:56:15', 0, 0, 2147483647, 'Wrong Answer (0/13)', NULL, 1),
(0, 197, 20, '2026-03-31 02:56:15', 0, 8, 2147483647, 'Wrong Answer (1/13)', '2026-03-31 02:57:31', 1),
(0, 198, 8, '2026-04-02 13:54:29', 1, NULL, NULL, NULL, NULL, 0),
(0, 198, 3, '2026-04-02 13:54:47', 0, NULL, NULL, NULL, NULL, 0),
(0, 198, 8, '2026-04-02 13:54:57', 1, 100, 2147483647, 'Accepted (12/12)', NULL, 1),
(0, 198, 3, '2026-04-02 13:54:57', 0, 100, 2147483647, 'Accepted (12/12)', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `duel_lobby_rooms`
--

CREATE TABLE `duel_lobby_rooms` (
  `lobby_id` int(11) NOT NULL,
  `room_code` varchar(10) NOT NULL,
  `room_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `host_user_id` int(11) NOT NULL,
  `max_players` int(11) NOT NULL DEFAULT 45,
  `difficulty` varchar(20) DEFAULT 'Easy',
  `is_private` tinyint(1) NOT NULL DEFAULT 0,
  `password` varchar(255) DEFAULT NULL,
  `problem_id` int(11) DEFAULT NULL,
  `status` enum('waiting','in_progress','completed','cancelled') NOT NULL DEFAULT 'waiting',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `started_at` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `allow_spectators` tinyint(1) DEFAULT 0 COMMENT 'Whether spectators can join this lobby',
  `host_spectator_mode` tinyint(1) DEFAULT 0 COMMENT 'Whether the host is in spectator mode (not playing)',
  `spectator_code` varchar(20) DEFAULT NULL COMMENT 'Unique code for spectators to join',
  `current_round` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lobby rooms with spectator mode support - hosts can enable spectators to watch matches';

--
-- Dumping data for table `duel_lobby_rooms`
--

INSERT INTO `duel_lobby_rooms` (`lobby_id`, `room_code`, `room_name`, `description`, `host_user_id`, `max_players`, `difficulty`, `is_private`, `password`, `problem_id`, `status`, `created_at`, `started_at`, `ended_at`, `allow_spectators`, `host_spectator_mode`, `spectator_code`, `current_round`) VALUES
(76, 'V915PF', 'dwa', 'dwa', 1, 2, 'Easy', 0, '', 3, 'in_progress', '2025-12-21 01:10:42', '2025-12-21 01:11:08', NULL, 0, 0, NULL, 0),
(97, 'OM4HGX', 'dwda', '', 1, 45, 'Easy', 0, '', 21, 'in_progress', '2025-12-21 22:04:29', '2025-12-21 22:05:36', NULL, 1, 0, 'ZXD0FV', 0),
(103, 'C5UA7T', 'dwa', '', 1, 45, 'Easy', 0, '', 42, 'in_progress', '2025-12-22 07:52:57', '2025-12-22 07:54:43', NULL, 1, 1, 'F9YAH5', 0),
(104, '3REHS6', 'dwa', '', 1, 45, 'Easy', 1, '0TN899', 41, 'in_progress', '2025-12-22 08:21:47', '2025-12-22 08:27:27', NULL, 1, 1, '930619', 0),
(105, '8ISH2V', 'dawd', '', 8, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-22 09:33:02', '2025-12-22 09:36:47', NULL, 1, 1, 'MI6FS6', 0),
(106, 'PART1K', 'dwa', '', 1, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-22 09:50:00', '2025-12-22 09:52:00', NULL, 1, 1, 'T3BORQ', 0),
(107, 'F26LVN', 'dwad', '', 1, 45, 'Easy', 0, '', 42, 'in_progress', '2025-12-22 10:20:02', '2025-12-22 10:21:30', NULL, 1, 1, 'BII6ND', 0),
(108, 'ARTT7H', 'dwad', '', 1, 45, 'Easy', 1, '7R52QE', 40, 'in_progress', '2025-12-27 12:49:33', '2025-12-27 12:54:52', NULL, 1, 1, '9R9VV3', 0),
(109, 'U52MVN', 'dawd', '', 1, 45, 'Easy', 1, 'V7OIZ0', 39, 'in_progress', '2025-12-27 13:26:49', '2025-12-27 13:29:02', NULL, 1, 1, 'KJWH1D', 0),
(110, 'XIYDEN', 'fefefwdaw', '', 8, 45, 'Easy', 1, 'KG2USC', 38, 'in_progress', '2025-12-27 13:43:14', '2025-12-27 13:43:59', NULL, 1, 1, 'TDT4TY', 0),
(111, 'EYFL9P', 'adwdawd', '', 3, 45, 'Easy', 1, 'YBR381', 36, 'in_progress', '2025-12-27 14:07:05', '2025-12-27 14:09:37', NULL, 0, 0, NULL, 0),
(112, 'SIKC00', 'dawdad', '', 3, 45, 'Easy', 1, 'T8G5VY', 33, 'in_progress', '2025-12-27 14:20:08', '2025-12-27 14:22:58', NULL, 1, 1, 'BBGH2Y', 0),
(114, 'TFN7IG', 'dwada', '', 1, 45, 'Easy', 1, 'H9TBDA', 35, 'in_progress', '2025-12-27 15:07:44', '2025-12-27 15:09:37', NULL, 1, 1, 'C5ORSY', 0),
(115, 'DSX7ZA', 'dwad', '', 1, 45, 'Easy', 1, 'DA7UIX', 2, 'in_progress', '2025-12-27 20:39:17', '2025-12-27 20:43:24', NULL, 1, 1, 'Z7LPBE', 0),
(117, 'B9JK25', 'dwadwa', '', 1, 45, 'Easy', 1, 'SE4FI7', 5, 'in_progress', '2025-12-27 21:37:38', '2025-12-27 21:42:44', NULL, 1, 1, '848JH9', 0),
(118, '4EW526', 'dawda', '', 1, 45, 'Easy', 1, 'UXCUNB', 4, 'in_progress', '2025-12-27 22:02:18', '2025-12-27 22:05:33', NULL, 0, 0, NULL, 0),
(119, 'MG5V1M', 'csdfcs', '', 1, 45, 'Easy', 1, '0P4XNO', 18, 'in_progress', '2025-12-27 22:26:59', '2025-12-27 22:28:05', NULL, 1, 1, 'H5P57J', 0),
(121, '09L44C', 'fesfsef', '', 1, 45, 'Easy', 1, 'FZAZMM', 18, 'in_progress', '2025-12-27 23:51:14', '2025-12-28 00:05:53', NULL, 1, 0, '2FS1MY', 0),
(122, 'YTQQKZ', 'dawd', '', 1, 45, 'Easy', 1, 'OK2VZK', 40, 'in_progress', '2025-12-28 01:23:30', '2025-12-28 01:28:56', NULL, 1, 1, 'SSY1M5', 0),
(123, 'GLY763', 'dwadaw', '', 1, 45, 'Easy', 1, '28CUS7', 3, 'in_progress', '2025-12-29 02:45:52', '2025-12-29 02:49:07', NULL, 1, 1, 'DVJGLI', 0),
(126, 'VY7UOK', 'dwaa', '', 8, 45, 'Easy', 1, 'ST8I90', 42, 'in_progress', '2025-12-29 06:03:06', '2025-12-29 06:12:54', NULL, 0, 0, NULL, 0),
(127, 'ZVW3KR', 'dwad', '', 1, 45, 'Easy', 1, '7YDB8C', 41, 'in_progress', '2025-12-29 07:03:40', '2025-12-29 07:05:30', NULL, 1, 1, 'J9ND66', 0),
(128, 'EIXPEH', 'dawd', '', 3, 45, 'Easy', 1, '4BNDXI', 5, 'in_progress', '2025-12-29 07:45:51', '2025-12-29 07:48:57', NULL, 0, 1, NULL, 0),
(132, 'BI2TAT', 'awds', '', 1, 45, 'Easy', 1, 'RFDDHS', 34, 'in_progress', '2025-12-30 00:43:24', '2025-12-30 00:58:56', NULL, 1, 0, '0PIDBT', 0),
(133, 'WU3AD0', 'daw', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 01:58:47', '2025-12-30 02:04:02', NULL, 1, 1, '6Y8U8I', 0),
(134, 'VDZZPY', 'awdf', '', 1, 45, 'Easy', 0, '', 3, 'in_progress', '2025-12-30 02:20:45', '2025-12-30 02:22:05', NULL, 1, 1, 'EEI49N', 0),
(136, 'HVV3T4', 'daww', '', 1, 45, 'Easy', 1, '6O2PCG', 37, 'in_progress', '2025-12-30 02:33:53', '2025-12-30 02:40:02', NULL, 1, 1, '256ANT', 0),
(137, 'VQ463G', 'faw', '', 8, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-30 02:45:20', '2025-12-30 03:00:39', NULL, 1, 1, 'X0OPJW', 0),
(139, '2H3HC6', 'adwwas', '', 1, 45, 'Easy', 0, '', 5, 'in_progress', '2025-12-30 03:48:42', '2025-12-30 03:50:45', NULL, 1, 1, '9CY3ZN', 0),
(140, 'BSH9QO', 'dawaw', '', 1, 45, 'Easy', 0, '', 37, 'in_progress', '2025-12-30 04:26:28', '2025-12-30 04:29:01', NULL, 1, 1, 'DC7TAS', 0),
(141, '79BBSJ', 'dwadwa', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 05:04:17', '2025-12-30 05:07:43', NULL, 1, 1, 'S77W1C', 0),
(143, 'DRAB19', 'dawd', '', 1, 45, 'Easy', 0, '', 42, 'in_progress', '2025-12-30 06:16:16', '2025-12-30 06:18:11', NULL, 1, 1, 'PDJDLH', 0),
(145, 'YB8KZ0', 'dawd', '', 1, 45, 'Easy', 0, '', 21, 'in_progress', '2025-12-30 06:27:55', '2025-12-30 06:30:28', NULL, 1, 1, 'R54XQH', 0),
(146, 'JAWE7K', 'dwad', '', 1, 45, 'Easy', 0, '', 39, 'in_progress', '2025-12-30 06:55:14', '2025-12-30 06:59:27', NULL, 1, 1, 'BFTPTP', 0),
(147, 'OD7M28', 'dwa', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 07:13:54', '2025-12-30 07:18:34', NULL, 1, 1, 'LIONAV', 0),
(148, '3IS5U0', 'dwa', '', 3, 45, 'Easy', 0, '', 5, 'in_progress', '2025-12-30 07:29:09', '2025-12-30 07:41:57', NULL, 1, 1, 'Y5YSQI', 0),
(149, 'JDYB8N', 'daww', '', 8, 45, 'Easy', 0, '', 34, 'in_progress', '2025-12-30 07:55:26', '2025-12-30 07:59:36', NULL, 1, 1, '8C086M', 0),
(150, 'FOITB1', 'fsefa', '', 8, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-30 08:13:08', '2025-12-30 08:17:32', NULL, 1, 1, 'LEYYB6', 0),
(151, '9LJ4LJ', 'dawd', '', 3, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 08:25:48', '2025-12-30 08:27:11', NULL, 0, 0, NULL, 0),
(152, 'PRSCTW', 'dawd', '', 1, 45, 'Easy', 0, '', 37, 'in_progress', '2025-12-30 08:36:49', '2025-12-30 08:39:25', NULL, 0, 0, NULL, 0),
(153, '249HQN', 'adwa', '', 1, 45, 'Easy', 0, '', 5, 'in_progress', '2025-12-30 08:46:12', '2025-12-30 08:49:57', NULL, 0, 0, NULL, 0),
(154, '6FKQ25', 'dawd', '', 3, 45, 'Easy', 0, '', 37, 'in_progress', '2025-12-30 08:51:51', '2025-12-30 08:52:21', NULL, 0, 0, NULL, 0),
(155, '88PWNY', 'DADW', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 10:17:08', '2025-12-30 11:14:20', NULL, 0, 0, NULL, 0),
(156, '3MDKB5', 'dwa', '', 3, 45, 'Easy', 0, '', 34, 'in_progress', '2025-12-30 11:18:35', '2025-12-30 11:18:58', NULL, 0, 0, NULL, 0),
(163, '8H1UX7', 'dawdw', '', 1, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-30 15:39:40', '2025-12-30 15:40:31', NULL, 0, 0, NULL, 0),
(164, 'BL652U', 'dwad', '', 1, 45, 'Easy', 0, '', 40, 'in_progress', '2025-12-30 15:54:47', '2025-12-30 15:55:18', NULL, 0, 0, NULL, 0),
(166, 'JGMV0M', 'dwa', '', 3, 45, 'Easy', 0, '', 37, 'in_progress', '2026-03-13 11:47:38', '2026-03-13 12:20:40', NULL, 0, 0, NULL, 0),
(167, 'H31T9V', 'dwa', '', 3, 45, 'Easy', 0, '', 42, 'in_progress', '2026-03-13 12:47:23', '2026-03-13 12:47:44', NULL, 0, 0, NULL, 0),
(168, 'L4XG1O', 'dwa', '', 3, 45, 'Easy', 0, '', 40, 'in_progress', '2026-03-13 12:53:04', '2026-03-13 12:55:59', NULL, 0, 0, NULL, 0),
(169, 'IBIQMI', 'wda', 'waadawdwa wdwa  ad aw', 3, 45, 'Easy', 0, '', 38, 'in_progress', '2026-03-13 13:02:02', '2026-03-13 13:03:18', NULL, 0, 0, NULL, 0),
(170, 'H99IPV', 'dwa', '', 3, 45, 'Easy', 0, '', 36, 'in_progress', '2026-03-13 13:19:00', '2026-03-13 13:20:12', NULL, 0, 0, NULL, 0),
(171, 'KNHFD3', 'dwa', '', 3, 45, 'Easy', 0, '', 37, 'in_progress', '2026-03-13 13:30:10', '2026-03-13 13:30:29', NULL, 0, 0, NULL, 0),
(172, 'Z1N6HO', 'dwa', '', 3, 45, 'Easy', 0, '', 42, 'in_progress', '2026-03-13 13:35:27', '2026-03-13 13:35:42', NULL, 0, 0, NULL, 0),
(173, 'U16B1M', 'dwa', '', 3, 45, 'Easy', 0, '', 37, 'in_progress', '2026-03-13 13:39:09', '2026-03-13 13:39:48', NULL, 0, 0, NULL, 0),
(176, 'PJ1BA6', 'dwad', '', 3, 45, 'Easy', 0, '', 38, 'in_progress', '2026-03-13 13:50:12', '2026-03-13 13:50:34', NULL, 0, 0, NULL, 0),
(177, 'AV371C', 'wda', '', 3, 45, 'Easy', 0, '', 39, 'in_progress', '2026-03-13 13:56:29', '2026-03-13 16:39:39', NULL, 0, 0, NULL, 0),
(178, 'PG29YF', 'dwa', '', 3, 45, 'Easy', 0, '', 40, 'in_progress', '2026-03-13 16:49:16', '2026-03-13 16:56:26', NULL, 1, 1, 'KWT3ZT', 5),
(179, 'HETZ4V', 'dwad', '', 3, 45, 'Medium', 0, '', 18, 'in_progress', '2026-03-13 17:10:08', '2026-03-13 17:10:38', NULL, 1, 1, '672T3K', 1),
(180, 'K8JICO', 'dadwa', '', 3, 45, 'Medium', 0, '', 33, 'in_progress', '2026-03-13 20:30:47', '2026-03-13 20:32:24', NULL, 1, 1, '0JXYXQ', 1),
(181, 'JFMB0U', 'dwa', '', 3, 45, 'Easy', 0, '', 39, 'in_progress', '2026-03-13 20:46:18', '2026-03-13 20:47:47', NULL, 1, 1, 'M4W783', 2),
(182, 'ERF74Z', 'dwada', '', 20, 45, 'Medium', 0, '', 18, 'in_progress', '2026-03-13 20:52:52', '2026-03-13 20:53:21', NULL, 1, 1, '8SN1SY', 1),
(184, 'INYDWL', 'dad', '', 3, 45, 'Medium', 0, '', 33, 'in_progress', '2026-03-13 20:59:26', '2026-03-13 21:00:02', NULL, 1, 1, 'JPY82N', 1),
(185, 'CLGZG7', 'dwa', '', 3, 45, 'Hard', 0, '', 5, 'in_progress', '2026-03-13 21:02:25', '2026-03-13 21:04:11', NULL, 1, 1, 'RK80B2', 2),
(186, 'HRQOI9', 'dwad', '', 3, 45, 'Medium', 0, '', 1, 'in_progress', '2026-03-13 21:11:44', '2026-03-13 21:14:54', NULL, 1, 1, 'NLWEP7', 3),
(187, '1S07B4', 'wa', '', 3, 45, 'Easy', 0, '', 41, 'in_progress', '2026-03-13 21:35:11', '2026-03-13 21:48:49', NULL, 1, 1, 'YRMIKS', 7),
(188, 'SFR8PF', 'daw', '', 3, 45, 'Easy', 0, '', 39, 'in_progress', '2026-03-13 21:53:31', '2026-03-13 21:56:32', NULL, 1, 1, '40AGXN', 3),
(189, 'WIUCLG', 'daw', '', 3, 45, 'Easy', 0, '', 38, 'in_progress', '2026-03-13 22:07:06', '2026-03-13 22:11:00', NULL, 1, 1, 'K0XOE6', 3),
(190, '39QN3D', 'sdsd', '', 3, 45, 'Medium', 0, '', 3, 'in_progress', '2026-03-13 22:21:39', '2026-03-13 22:24:53', NULL, 1, 1, 'D1X8RG', 3),
(191, '0X47XW', 'dwa', '', 3, 45, 'Medium', 0, '', 1, 'in_progress', '2026-03-13 22:38:59', '2026-03-13 22:45:23', NULL, 1, 1, 'Z7YZM9', 3),
(196, '99SCM5', 'dwa', '', 8, 45, 'Easy', 0, '', 37, 'in_progress', '2026-03-21 14:16:10', '2026-03-21 14:16:18', NULL, 0, 0, NULL, 1),
(197, 'AS2ADO', 'python', '', 3, 45, 'Easy', 1, '3PB76Q', 41, 'in_progress', '2026-03-31 02:54:09', '2026-03-31 02:56:15', NULL, 1, 1, '7792IP', 1),
(198, '7UN529', 'dwad', '', 8, 45, 'Easy', 0, '', 100, 'in_progress', '2026-04-02 13:54:28', '2026-04-02 13:54:57', NULL, 0, 0, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `duel_matches`
--

CREATE TABLE `duel_matches` (
  `match_id` int(11) NOT NULL,
  `player1_id` int(11) NOT NULL,
  `player2_id` int(11) NOT NULL,
  `winner_id` int(11) DEFAULT NULL,
  `match_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('waiting','in_progress','completed','abandoned') DEFAULT 'waiting',
  `match_duration_minutes` int(11) DEFAULT 30 COMMENT 'Match duration in minutes',
  `match_started_at` datetime DEFAULT NULL COMMENT 'When match actually started',
  `match_end_time` datetime DEFAULT NULL COMMENT 'Calculated end time for timer',
  `dp_awarded` tinyint(1) DEFAULT 0 COMMENT 'Whether duel points have been awarded',
  `xp_awarded` tinyint(1) DEFAULT 0 COMMENT 'Whether XP has been awarded',
  `problem_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `duel_matches`
--

INSERT INTO `duel_matches` (`match_id`, `player1_id`, `player2_id`, `winner_id`, `match_date`, `status`, `match_duration_minutes`, `match_started_at`, `match_end_time`, `dp_awarded`, `xp_awarded`, `problem_id`) VALUES
(1, 1, 3, NULL, '2025-12-06 06:01:31', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(2, 3, 1, NULL, '2025-12-07 01:32:04', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(4, 1, 3, NULL, '2025-12-11 19:52:51', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(5, 1, 3, NULL, '2025-12-11 21:45:34', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(6, 1, 3, NULL, '2025-12-11 21:55:22', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(7, 3, 1, NULL, '2025-12-11 22:12:08', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(8, 1, 3, NULL, '2025-12-12 00:35:29', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(9, 1, 3, NULL, '2025-12-12 00:52:39', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(10, 3, 1, NULL, '2025-12-12 01:37:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(11, 1, 3, NULL, '2025-12-12 01:47:05', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(12, 1, 3, NULL, '2025-12-12 02:18:53', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(13, 3, 1, NULL, '2025-12-12 02:32:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(14, 3, 1, NULL, '2025-12-12 06:46:18', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(15, 1, 3, NULL, '2025-12-12 09:25:52', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(16, 1, 3, NULL, '2025-12-12 09:28:10', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(17, 1, 3, NULL, '2025-12-12 09:36:25', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(18, 1, 3, NULL, '2025-12-12 09:45:03', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(19, 1, 3, NULL, '2025-12-12 09:58:51', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(20, 1, 3, NULL, '2025-12-12 10:14:35', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(21, 1, 3, NULL, '2025-12-12 10:35:18', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(22, 3, 1, NULL, '2025-12-12 10:48:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(23, 3, 1, NULL, '2025-12-12 10:59:47', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(24, 3, 1, NULL, '2025-12-12 11:12:52', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(25, 3, 1, NULL, '2025-12-12 11:46:03', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(26, 3, 1, NULL, '2025-12-12 12:52:48', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(27, 3, 1, NULL, '2025-12-12 13:42:11', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(28, 1, 3, NULL, '2025-12-12 13:55:57', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(29, 3, 1, NULL, '2025-12-12 13:59:57', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(30, 3, 1, NULL, '2025-12-12 14:08:52', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(31, 3, 1, NULL, '2025-12-12 14:17:03', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(32, 1, 3, NULL, '2025-12-12 14:36:50', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(33, 1, 3, NULL, '2025-12-12 14:37:17', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(34, 1, 3, NULL, '2025-12-12 14:37:49', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(35, 1, 3, NULL, '2025-12-13 06:27:59', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(36, 1, 3, NULL, '2025-12-13 06:30:47', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(37, 3, 1, NULL, '2025-12-13 06:36:18', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(38, 1, 3, NULL, '2025-12-13 06:39:24', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(39, 1, 3, NULL, '2025-12-13 06:42:03', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(40, 1, 3, NULL, '2025-12-13 06:45:19', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(41, 1, 3, NULL, '2025-12-13 06:51:14', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(42, 1, 3, NULL, '2025-12-13 06:56:39', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(43, 1, 3, NULL, '2025-12-13 07:01:58', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(44, 1, 3, NULL, '2025-12-13 07:08:46', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(45, 1, 3, NULL, '2025-12-13 07:16:28', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(46, 3, 1, NULL, '2025-12-13 07:30:12', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(47, 1, 3, NULL, '2025-12-13 07:43:57', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(48, 1, 3, NULL, '2025-12-13 07:54:40', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(49, 3, 1, NULL, '2025-12-13 07:56:30', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(50, 1, 3, NULL, '2025-12-13 08:00:05', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(51, 1, 3, NULL, '2025-12-13 08:14:18', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(52, 1, 3, NULL, '2025-12-13 08:20:32', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(53, 1, 3, NULL, '2025-12-13 08:27:52', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(54, 1, 3, NULL, '2025-12-13 08:31:06', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(55, 3, 1, NULL, '2025-12-13 08:32:44', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(56, 3, 1, NULL, '2025-12-13 08:34:10', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(57, 3, 1, NULL, '2025-12-13 08:36:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(58, 1, 3, NULL, '2025-12-13 08:37:48', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(59, 1, 3, NULL, '2025-12-13 08:39:32', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(60, 1, 3, NULL, '2025-12-13 09:23:33', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(61, 1, 3, NULL, '2025-12-13 10:24:03', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(62, 3, 1, NULL, '2025-12-13 10:31:51', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(63, 3, 1, NULL, '2025-12-13 10:41:10', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(64, 1, 3, NULL, '2025-12-13 10:42:40', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(65, 3, 1, NULL, '2025-12-13 10:44:25', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(66, 1, 3, NULL, '2025-12-13 10:50:13', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(67, 1, 3, NULL, '2025-12-13 10:58:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(68, 1, 3, NULL, '2025-12-13 11:15:14', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(69, 1, 3, NULL, '2025-12-13 11:22:54', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(70, 3, 1, NULL, '2025-12-13 11:29:26', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(71, 1, 3, NULL, '2025-12-13 11:30:29', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(72, 1, 3, NULL, '2025-12-13 11:32:37', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(73, 1, 3, NULL, '2025-12-13 11:36:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(74, 3, 1, NULL, '2025-12-13 11:38:31', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(75, 1, 3, NULL, '2025-12-13 11:39:45', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(76, 1, 3, NULL, '2025-12-13 11:43:20', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(77, 1, 3, NULL, '2025-12-13 11:48:20', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(78, 3, 1, NULL, '2025-12-13 11:50:18', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(79, 3, 1, NULL, '2025-12-13 11:51:19', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(80, 3, 1, NULL, '2025-12-13 11:55:49', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(81, 1, 3, NULL, '2025-12-13 12:18:18', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(82, 3, 1, 1, '2025-12-13 19:45:15', 'completed', 30, NULL, NULL, 0, 0, NULL),
(83, 3, 1, 3, '2025-12-13 19:53:39', 'completed', 30, NULL, NULL, 0, 0, NULL),
(84, 1, 3, 3, '2025-12-13 19:56:35', 'completed', 30, NULL, NULL, 0, 0, NULL),
(85, 3, 1, NULL, '2025-12-13 20:08:49', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(86, 1, 3, 3, '2025-12-13 20:16:12', 'completed', 30, NULL, NULL, 0, 0, NULL),
(87, 1, 3, 1, '2025-12-13 20:31:25', 'completed', 30, NULL, NULL, 0, 0, NULL),
(88, 1, 3, 3, '2025-12-13 20:43:22', 'completed', 30, NULL, NULL, 0, 0, NULL),
(89, 1, 3, 1, '2025-12-13 20:49:07', 'completed', 30, NULL, NULL, 0, 0, NULL),
(90, 3, 1, 1, '2025-12-13 21:02:53', 'completed', 30, NULL, NULL, 0, 0, NULL),
(91, 1, 3, 1, '2025-12-13 21:38:51', 'completed', 30, NULL, NULL, 0, 0, NULL),
(92, 1, 3, 3, '2025-12-13 22:48:17', 'completed', 30, NULL, NULL, 0, 0, NULL),
(93, 1, 8, 1, '2025-12-13 22:57:41', 'completed', 30, NULL, NULL, 0, 0, NULL),
(94, 1, 8, 8, '2025-12-13 23:15:50', 'completed', 30, NULL, NULL, 0, 0, NULL),
(95, 1, 8, 8, '2025-12-13 23:32:01', 'completed', 30, NULL, NULL, 0, 0, NULL),
(96, 8, 1, 8, '2025-12-13 23:38:26', 'completed', 30, NULL, NULL, 0, 0, NULL),
(97, 8, 1, 1, '2025-12-13 23:43:58', 'completed', 30, NULL, NULL, 0, 0, NULL),
(98, 1, 8, 1, '2025-12-13 23:46:16', 'completed', 30, NULL, NULL, 0, 0, NULL),
(99, 1, 8, 1, '2025-12-13 23:51:15', 'completed', 30, NULL, NULL, 0, 0, NULL),
(100, 1, 8, NULL, '2025-12-14 00:10:55', 'completed', 30, NULL, NULL, 0, 0, NULL),
(101, 1, 8, 1, '2025-12-14 00:12:17', 'completed', 30, NULL, NULL, 0, 0, NULL),
(102, 8, 1, 8, '2025-12-14 00:15:38', 'completed', 30, NULL, NULL, 0, 0, NULL),
(103, 1, 8, 1, '2025-12-14 00:23:36', 'completed', 30, NULL, NULL, 0, 0, NULL),
(104, 1, 8, 1, '2025-12-14 00:33:27', 'completed', 30, NULL, NULL, 0, 0, NULL),
(105, 8, 1, 1, '2025-12-14 00:44:59', 'completed', 30, NULL, NULL, 0, 0, NULL),
(106, 1, 3, NULL, '2025-12-14 01:18:44', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(107, 1, 3, 1, '2025-12-14 01:24:54', 'completed', 30, NULL, NULL, 0, 0, NULL),
(108, 1, 3, 3, '2025-12-14 01:28:07', 'completed', 30, NULL, NULL, 0, 0, NULL),
(109, 3, 1, NULL, '2025-12-14 02:01:39', '', 30, NULL, NULL, 0, 0, NULL),
(110, 1, 3, NULL, '2025-12-14 02:18:48', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(111, 1, 3, NULL, '2025-12-14 02:28:02', '', 30, NULL, NULL, 0, 0, NULL),
(112, 3, 1, NULL, '2025-12-14 02:34:36', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(113, 3, 1, NULL, '2025-12-14 05:57:16', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(114, 3, 1, NULL, '2025-12-14 06:09:16', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(115, 1, 3, NULL, '2025-12-14 06:20:57', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(116, 1, 3, NULL, '2025-12-14 06:21:51', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(117, 1, 3, 3, '2025-12-14 06:34:45', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(118, 3, 1, 1, '2025-12-14 06:35:54', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(119, 1, 3, 1, '2025-12-14 06:38:32', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(120, 1, 3, NULL, '2025-12-14 06:40:36', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(121, 1, 3, NULL, '2025-12-14 07:10:01', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(122, 3, 1, NULL, '2025-12-14 07:13:09', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(123, 1, 3, 3, '2025-12-14 07:16:41', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(124, 1, 3, NULL, '2025-12-14 07:56:04', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(125, 1, 3, NULL, '2025-12-14 08:08:47', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(126, 1, 3, NULL, '2025-12-14 08:18:15', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(127, 1, 3, NULL, '2025-12-14 08:21:36', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(128, 1, 3, NULL, '2025-12-14 08:28:07', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(129, 3, 1, NULL, '2025-12-14 08:38:55', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(130, 1, 3, 3, '2025-12-14 08:48:11', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(131, 1, 3, 3, '2025-12-14 09:02:39', 'completed', 30, NULL, NULL, 0, 0, NULL),
(132, 1, 3, NULL, '2025-12-14 09:22:39', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(133, 1, 3, NULL, '2025-12-14 09:27:13', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(134, 1, 3, NULL, '2025-12-14 09:32:56', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(135, 1, 3, NULL, '2025-12-14 09:39:12', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(136, 1, 3, 3, '2025-12-14 09:44:54', 'completed', 30, NULL, NULL, 0, 0, NULL),
(137, 3, 1, NULL, '2025-12-14 10:40:02', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(138, 1, 3, 3, '2025-12-14 10:51:43', 'completed', 30, NULL, NULL, 0, 0, NULL),
(139, 3, 1, 3, '2025-12-14 10:54:03', 'completed', 30, NULL, NULL, 0, 0, NULL),
(140, 1, 3, 3, '2025-12-14 11:01:41', 'completed', 30, NULL, NULL, 0, 0, NULL),
(141, 1, 3, NULL, '2025-12-14 11:03:04', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(142, 1, 3, NULL, '2025-12-14 11:23:49', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(143, 1, 3, 1, '2025-12-14 11:25:58', 'completed', 30, NULL, NULL, 0, 0, NULL),
(144, 1, 3, NULL, '2025-12-14 11:30:03', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(145, 1, 3, NULL, '2025-12-14 11:38:15', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(146, 3, 1, NULL, '2025-12-14 11:40:51', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(147, 1, 3, NULL, '2025-12-14 11:43:48', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(148, 3, 1, NULL, '2025-12-14 11:52:49', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(149, 1, 3, 3, '2025-12-14 11:56:44', 'completed', 30, NULL, NULL, 0, 0, NULL),
(150, 3, 1, NULL, '2025-12-14 12:04:44', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(151, 1, 3, NULL, '2025-12-14 12:09:31', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(152, 1, 3, NULL, '2025-12-14 12:17:38', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(153, 1, 3, NULL, '2025-12-14 12:19:55', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(154, 1, 3, 1, '2025-12-14 12:20:44', 'completed', 30, NULL, NULL, 0, 0, NULL),
(155, 3, 1, 3, '2025-12-14 13:47:06', 'completed', 30, NULL, NULL, 0, 0, NULL),
(156, 3, 1, 1, '2025-12-14 13:55:59', 'completed', 30, NULL, NULL, 0, 0, NULL),
(157, 1, 3, 3, '2025-12-14 19:24:21', 'completed', 30, NULL, NULL, 0, 0, NULL),
(158, 1, 3, NULL, '2025-12-14 19:26:23', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(159, 1, 3, 3, '2025-12-14 19:27:30', 'completed', 30, NULL, NULL, 0, 0, NULL),
(160, 3, 1, 3, '2025-12-14 20:16:31', 'completed', 30, NULL, NULL, 0, 0, NULL),
(161, 3, 1, NULL, '2025-12-14 22:16:57', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(162, 1, 3, NULL, '2025-12-14 22:29:26', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(163, 1, 3, NULL, '2025-12-14 22:38:49', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(164, 1, 3, NULL, '2025-12-14 22:44:06', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(165, 1, 3, 3, '2025-12-14 22:45:05', 'completed', 30, NULL, NULL, 0, 0, NULL),
(166, 1, 3, 3, '2025-12-15 12:29:03', 'completed', 30, NULL, NULL, 0, 0, NULL),
(167, 3, 1, 1, '2025-12-15 12:30:36', 'completed', 30, NULL, NULL, 0, 0, NULL),
(168, 3, 1, 1, '2025-12-15 12:34:45', 'completed', 30, NULL, NULL, 0, 0, NULL),
(169, 3, 1, 1, '2025-12-15 12:40:20', 'completed', 30, NULL, NULL, 0, 0, NULL),
(170, 1, 3, 1, '2025-12-15 12:49:37', 'completed', 30, NULL, NULL, 0, 0, NULL),
(171, 1, 3, NULL, '2025-12-15 12:51:15', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(172, 3, 1, 1, '2025-12-15 13:02:54', 'completed', 30, NULL, NULL, 0, 0, NULL),
(173, 1, 3, NULL, '2025-12-15 13:04:54', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(174, 3, 1, NULL, '2025-12-15 13:12:33', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(175, 3, 1, NULL, '2025-12-15 13:24:10', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(176, 3, 1, NULL, '2025-12-15 13:27:49', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(177, 1, 3, NULL, '2025-12-15 13:31:46', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(178, 3, 1, 1, '2025-12-15 13:43:54', 'completed', 30, NULL, NULL, 0, 0, NULL),
(179, 1, 3, NULL, '2025-12-15 13:45:59', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(180, 1, 3, NULL, '2025-12-15 13:54:22', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(181, 1, 3, NULL, '2025-12-15 14:04:14', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(182, 1, 3, 3, '2025-12-15 14:19:09', 'completed', 30, NULL, NULL, 0, 0, NULL),
(183, 1, 3, 1, '2025-12-15 14:22:59', 'completed', 30, NULL, NULL, 0, 0, NULL),
(184, 3, 1, 1, '2025-12-15 14:25:09', 'completed', 30, NULL, NULL, 0, 0, NULL),
(185, 1, 3, 3, '2025-12-15 14:26:30', 'completed', 30, NULL, NULL, 0, 0, NULL),
(186, 1, 3, NULL, '2025-12-15 14:28:40', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(187, 1, 3, NULL, '2025-12-15 14:46:39', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(188, 1, 3, NULL, '2025-12-15 15:14:20', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(189, 1, 3, 3, '2025-12-15 15:43:34', 'completed', 30, NULL, NULL, 0, 0, NULL),
(190, 3, 1, 3, '2025-12-15 15:48:00', 'completed', 30, NULL, NULL, 0, 0, NULL),
(191, 1, 3, NULL, '2025-12-15 15:51:43', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(192, 1, 3, NULL, '2025-12-15 16:53:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(193, 1, 3, NULL, '2025-12-15 16:55:25', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(194, 1, 3, 1, '2025-12-15 17:03:33', 'completed', 30, NULL, NULL, 0, 0, NULL),
(195, 3, 1, NULL, '2025-12-15 17:05:40', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(196, 1, 3, 1, '2025-12-15 17:20:53', 'completed', 30, NULL, NULL, 0, 0, NULL),
(197, 1, 3, NULL, '2025-12-15 17:22:16', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(198, 3, 1, 1, '2025-12-15 18:37:46', 'completed', 30, NULL, NULL, 0, 0, NULL),
(199, 1, 3, NULL, '2025-12-15 18:42:07', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(200, 1, 3, NULL, '2025-12-15 19:07:06', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(201, 1, 3, NULL, '2025-12-15 19:21:40', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(202, 3, 1, NULL, '2025-12-15 19:24:45', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(203, 3, 1, 3, '2025-12-15 19:37:20', 'completed', 30, NULL, NULL, 0, 0, NULL),
(204, 1, 3, NULL, '2025-12-15 19:39:16', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(205, 1, 3, NULL, '2025-12-15 20:31:15', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(206, 1, 3, NULL, '2025-12-15 20:49:25', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(207, 1, 3, NULL, '2025-12-15 20:52:22', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(208, 1, 3, NULL, '2025-12-15 21:46:13', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(209, 1, 3, NULL, '2025-12-15 21:53:10', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(210, 1, 3, NULL, '2025-12-15 22:03:07', 'in_progress', 30, NULL, NULL, 0, 0, NULL),
(211, 1, 3, 1, '2025-12-15 22:06:53', 'completed', 30, NULL, NULL, 0, 0, NULL),
(212, 3, 1, NULL, '2025-12-15 22:09:14', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(213, 1, 3, NULL, '2025-12-15 22:30:29', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(214, 3, 1, NULL, '2025-12-15 22:41:39', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(215, 3, 1, NULL, '2025-12-15 22:50:49', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(216, 3, 1, NULL, '2025-12-15 22:53:42', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(217, 1, 3, NULL, '2025-12-15 22:58:22', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(218, 1, 3, NULL, '2025-12-15 23:03:57', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(219, 1, 3, NULL, '2025-12-15 23:09:03', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(220, 8, 1, NULL, '2025-12-15 23:11:22', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(221, 1, 8, NULL, '2025-12-15 23:15:47', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(222, 1, 8, NULL, '2025-12-15 23:16:54', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(223, 1, 8, NULL, '2025-12-15 23:28:26', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(224, 1, 8, NULL, '2025-12-15 23:35:33', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(225, 8, 1, NULL, '2025-12-15 23:37:19', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(226, 1, 8, NULL, '2025-12-16 00:30:42', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(227, 1, 8, NULL, '2025-12-16 00:34:46', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(228, 1, 8, NULL, '2025-12-16 00:43:44', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(229, 1, 8, NULL, '2025-12-16 00:51:09', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(230, 1, 8, NULL, '2025-12-16 00:56:51', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(231, 1, 8, NULL, '2025-12-16 01:11:32', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(232, 1, 8, NULL, '2025-12-16 01:15:15', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(233, 1, 8, NULL, '2025-12-16 01:18:32', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(234, 1, 8, NULL, '2025-12-16 01:40:13', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(235, 1, 8, NULL, '2025-12-16 01:42:36', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(236, 3, 1, 3, '2025-12-16 05:54:24', 'completed', 30, NULL, NULL, 0, 0, NULL),
(237, 1, 3, 3, '2025-12-16 05:58:51', 'completed', 30, NULL, NULL, 0, 0, NULL),
(238, 1, 3, NULL, '2025-12-16 06:10:58', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(239, 1, 3, NULL, '2025-12-16 06:14:08', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(240, 1, 3, NULL, '2025-12-16 06:19:06', 'abandoned', 30, NULL, NULL, 0, 0, NULL),
(241, 3, 1, 1, '2025-12-21 00:21:02', 'completed', 30, NULL, NULL, 0, 0, NULL),
(242, 3, 1, NULL, '2025-12-21 23:26:50', 'in_progress', 30, '2025-12-22 07:26:50', '2025-12-22 07:56:50', 0, 0, NULL),
(243, 3, 1, NULL, '2025-12-21 23:42:49', 'in_progress', 30, '2025-12-22 07:42:49', '2025-12-22 08:12:49', 0, 0, NULL),
(244, 1, 3, 1, '2025-12-21 23:43:56', 'completed', 30, '2025-12-22 07:43:56', '2025-12-22 08:13:56', 0, 0, NULL),
(245, 3, 1, 1, '2025-12-22 00:49:51', 'completed', 15, '2025-12-22 08:49:51', '2025-12-22 09:04:51', 0, 0, NULL),
(246, 3, 1, 3, '2025-12-22 00:55:41', 'completed', 15, '2025-12-22 08:55:41', '2025-12-22 09:10:41', 0, 0, NULL),
(247, 3, 1, 3, '2025-12-22 01:05:05', 'completed', 15, '2025-12-22 09:05:05', '2025-12-22 09:20:05', 0, 0, NULL),
(248, 1, 3, 1, '2025-12-22 01:19:46', 'completed', 15, '2025-12-22 09:19:46', '2025-12-22 09:34:46', 0, 0, NULL),
(249, 1, 3, 1, '2025-12-22 05:05:45', 'completed', 15, '2025-12-22 13:05:45', '2025-12-22 13:20:45', 0, 0, NULL),
(250, 3, 1, 1, '2025-12-22 05:23:22', 'completed', 30, '2025-12-22 13:23:22', '2025-12-22 13:53:22', 0, 0, NULL),
(251, 3, 1, 1, '2025-12-22 05:35:51', 'completed', 15, '2025-12-22 13:35:51', '2025-12-22 13:50:51', 0, 0, NULL),
(252, 1, 3, 3, '2025-12-22 06:03:07', 'completed', 30, '2025-12-22 14:03:07', '2025-12-22 14:33:07', 0, 0, NULL),
(253, 3, 1, NULL, '2025-12-22 06:05:43', 'abandoned', 15, '2025-12-22 14:05:43', '2025-12-22 14:20:43', 0, 0, NULL),
(254, 1, 8, 8, '2025-12-30 08:07:37', 'completed', 15, '2025-12-30 16:07:37', '2025-12-30 16:22:37', 0, 0, NULL),
(255, 1, 8, 8, '2025-12-30 08:10:00', 'completed', 15, '2025-12-30 16:10:00', '2025-12-30 16:25:00', 0, 0, NULL),
(256, 3, 8, NULL, '2026-03-09 07:18:34', 'in_progress', 30, '2026-03-09 15:18:34', '2026-03-09 15:48:34', 0, 0, NULL),
(257, 3, 8, 8, '2026-03-13 22:49:01', 'completed', 30, '2026-03-14 06:49:01', '2026-03-14 07:19:01', 0, 0, NULL),
(258, 3, 8, 3, '2026-03-13 22:50:09', 'completed', 15, '2026-03-14 06:50:09', '2026-03-14 07:05:09', 0, 0, NULL),
(259, 3, 8, 3, '2026-03-21 14:11:00', 'completed', 15, '2026-03-21 22:11:00', '2026-03-21 22:26:00', 0, 0, NULL),
(260, 3, 8, 3, '2026-03-31 02:39:01', 'completed', 15, '2026-03-31 10:39:01', '2026-03-31 10:54:01', 0, 0, NULL),
(261, 8, 3, 8, '2026-03-31 02:50:41', 'completed', 15, '2026-03-31 10:50:41', '2026-03-31 11:05:41', 0, 0, NULL),
(262, 3, 8, 3, '2026-04-02 02:08:10', 'completed', 45, '2026-04-02 10:08:10', '2026-04-02 10:53:10', 0, 0, NULL),
(263, 8, 3, 8, '2026-04-02 02:25:53', 'completed', 30, '2026-04-02 10:25:53', '2026-04-02 10:55:53', 0, 0, NULL),
(264, 8, 3, 3, '2026-04-02 02:41:43', 'completed', 30, '2026-04-02 10:41:43', '2026-04-02 11:11:43', 0, 0, NULL),
(265, 3, 8, NULL, '2026-04-02 02:42:35', 'in_progress', 30, '2026-04-02 10:42:35', '2026-04-02 11:12:35', 0, 0, NULL),
(266, 3, 8, NULL, '2026-04-02 02:49:19', 'in_progress', 30, '2026-04-02 10:49:19', '2026-04-02 11:19:19', 0, 0, NULL),
(267, 3, 8, NULL, '2026-04-02 02:56:11', 'in_progress', 30, '2026-04-02 10:56:11', '2026-04-02 11:26:11', 0, 0, NULL),
(268, 8, 3, NULL, '2026-04-02 03:17:35', 'in_progress', 30, '2026-04-02 11:17:35', '2026-04-02 11:47:35', 0, 0, NULL),
(269, 8, 3, NULL, '2026-04-02 03:22:56', 'in_progress', 45, '2026-04-02 11:22:56', '2026-04-02 12:07:56', 0, 0, NULL),
(270, 8, 3, NULL, '2026-04-02 03:25:14', 'in_progress', 15, '2026-04-02 11:25:14', '2026-04-02 11:40:14', 0, 0, NULL),
(271, 8, 3, 8, '2026-04-02 03:31:07', 'completed', 45, '2026-04-02 11:31:07', '2026-04-02 12:16:07', 0, 0, NULL),
(272, 8, 3, 3, '2026-04-02 03:38:10', 'completed', 45, '2026-04-02 11:38:10', '2026-04-02 12:23:10', 0, 0, 120),
(273, 3, 8, 3, '2026-04-02 04:02:58', 'completed', 30, '2026-04-02 12:02:58', '2026-04-02 12:32:58', 0, 0, 114),
(274, 8, 3, 8, '2026-04-02 04:25:34', 'completed', 30, '2026-04-02 12:25:34', '2026-04-02 12:55:34', 0, 0, 112),
(275, 8, 3, 8, '2026-04-02 08:48:10', 'completed', 30, '2026-04-02 16:48:10', '2026-04-02 17:18:10', 0, 0, 110),
(276, 3, 8, 8, '2026-04-02 08:49:22', 'completed', 45, '2026-04-02 16:49:22', '2026-04-02 17:34:22', 0, 0, 122),
(277, 3, 8, 3, '2026-04-02 08:51:48', 'completed', 45, '2026-04-02 16:51:48', '2026-04-02 17:36:48', 0, 0, 122),
(278, 3, 8, NULL, '2026-04-02 12:49:48', 'in_progress', 45, '2026-04-02 20:49:48', '2026-04-02 21:34:48', 0, 0, 122),
(279, 3, 8, NULL, '2026-04-02 13:17:43', 'in_progress', 45, '2026-04-02 21:17:43', '2026-04-02 22:02:43', 0, 0, NULL),
(280, 8, 3, 8, '2026-04-02 13:23:06', 'completed', 30, '2026-04-02 21:23:06', '2026-04-02 21:53:06', 0, 0, 115),
(281, 3, 8, 3, '2026-04-02 13:27:28', 'completed', 30, '2026-04-02 21:27:28', '2026-04-02 21:57:28', 0, 0, 114),
(282, 3, 8, 8, '2026-04-02 13:34:48', 'completed', 45, '2026-04-02 21:34:48', '2026-04-02 22:19:48', 0, 0, 122),
(283, 3, 8, 8, '2026-04-02 13:36:16', 'completed', 45, '2026-04-02 21:36:16', '2026-04-02 22:21:16', 0, 0, 121),
(284, 8, 3, 8, '2026-04-02 13:36:53', 'completed', 30, '2026-04-02 21:36:53', '2026-04-02 22:06:53', 0, 0, 110),
(285, 3, 8, 3, '2026-04-02 13:38:43', 'completed', 45, '2026-04-02 21:38:43', '2026-04-02 22:23:43', 0, 0, 118),
(286, 3, 8, 3, '2026-04-02 13:49:00', 'completed', 45, '2026-04-02 21:49:00', '2026-04-02 22:34:00', 0, 0, 120),
(287, 8, 3, 8, '2026-04-02 13:50:04', 'completed', 15, '2026-04-02 21:50:04', '2026-04-02 22:05:04', 0, 0, 102),
(288, 3, 8, 8, '2026-04-02 13:53:11', 'completed', 30, '2026-04-02 21:53:11', '2026-04-02 22:23:11', 0, 0, 112);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `host_id` int(11) NOT NULL,
  `reward_points` int(11) DEFAULT 0,
  `reward_level` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('open','closed','finished','upcoming') DEFAULT 'upcoming'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `event_name`, `thumbnail_url`, `host_id`, `reward_points`, `reward_level`, `created_at`, `status`) VALUES
(10, 'Spring Code Sprint', 'asset/events/spring_sprint_thumb.jpg', 3, 300, 3, '2025-12-10 11:40:04', 'upcoming'),
(11, 'Winter Coding Jam', 'asset/events/winter_jam_thumb.jpg', 4, 250, 2, '2025-12-10 11:40:04', 'upcoming'),
(12, 'Algorithm Showdown', 'asset/events/algo_showdown_thumb.jpg', 7, 400, 4, '2025-12-10 11:40:04', 'upcoming');

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `participant_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_schedule`
--

CREATE TABLE `event_schedule` (
  `schedule_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_schedule`
--

INSERT INTO `event_schedule` (`schedule_id`, `event_id`, `starts_at`, `ends_at`) VALUES
(10, 10, '2025-12-15 10:00:00', '2025-12-15 18:00:00'),
(11, 11, '2025-12-20 09:00:00', '2025-12-20 17:00:00'),
(12, 12, '2025-12-22 13:00:00', '2025-12-22 20:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_pending_changes`
--

CREATE TABLE `faculty_pending_changes` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `change_type` enum('problem','event','blog','user_edit','admin_edit') NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` int(11) NOT NULL,
  `action_type` enum('create','update','delete') NOT NULL,
  `original_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`original_data`)),
  `proposed_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`proposed_data`)),
  `status` enum('pending_faculty_review','faculty_approved','pending_admin','committed','rejected') DEFAULT 'pending_faculty_review',
  `faculty_review_date` timestamp NULL DEFAULT NULL,
  `faculty_reviewer_id` int(11) DEFAULT NULL,
  `faculty_review_comment` text DEFAULT NULL,
  `admin_review_date` timestamp NULL DEFAULT NULL,
  `admin_reviewer_id` int(11) DEFAULT NULL,
  `admin_review_comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_pending_changes`
--

INSERT INTO `faculty_pending_changes` (`id`, `faculty_id`, `change_type`, `table_name`, `record_id`, `action_type`, `original_data`, `proposed_data`, `status`, `faculty_review_date`, `faculty_reviewer_id`, `faculty_review_comment`, `admin_review_date`, `admin_reviewer_id`, `admin_review_comment`, `created_at`, `updated_at`) VALUES
(10, 21, 'event', 'events', 29, 'create', NULL, '{\"event_name\":\"testestestest\",\"thumbnail_url\":\"/asset/event/1766276781778_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":21,\"reward_points\":1,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2025-12-29T00:26:00.000Z\",\"ends_at\":\"2025-12-30T00:26:00.000Z\"}', 'committed', NULL, NULL, NULL, '2025-12-21 08:28:42', 4, 'Committed by admin 4', '2025-12-21 00:26:21', '2025-12-21 08:28:42'),
(12, 21, 'blog', 'blogs', 17, 'create', NULL, '{\"title\":\"nononnnnononononono\",\"content\":\"aaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":21,\"thumbnail_url\":\"/asset/blog/1766279003251_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'committed', NULL, NULL, NULL, '2025-12-21 08:28:42', 4, 'Committed by admin 4', '2025-12-21 01:03:23', '2025-12-21 08:28:42'),
(13, 21, 'problem', 'problems', 117, 'create', NULL, '{\"problem_name\":\"yesyesyesyesyesyes\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', NULL, NULL, NULL, '2025-12-21 09:57:20', 4, 'Committed by admin 4', '2025-12-21 01:04:53', '2025-12-21 09:57:20'),
(14, 21, 'problem', 'problems', 116, 'create', NULL, '{\"problem_name\":\"faculty problem test 1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'1\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"11\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[3]}', 'committed', '2025-12-21 05:13:59', 21, 'Approved via script by user 21', '2025-12-21 07:52:14', 4, 'Approved by admin', '2025-12-21 04:47:54', '2025-12-21 07:52:14'),
(15, 21, 'problem', 'problems', 118, 'create', NULL, '{\"problem_name\":\"Problem by faculty test 3\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":4,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[3,6]}', 'committed', NULL, NULL, NULL, '2025-12-21 09:57:20', 4, 'Committed by admin 4', '2025-12-21 08:40:51', '2025-12-21 09:57:20'),
(16, 21, 'event', 'events', 30, 'create', NULL, '{\"event_name\":\"Browser Smoke Event\",\"thumbnail_url\":\"/asset/event/1766309913625_smoke.png\",\"host_id\":21,\"reward_points\":10,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2025-12-21T10:38:33.610Z\",\"ends_at\":\"2025-12-21T11:38:33.615Z\"}', 'committed', NULL, NULL, NULL, '2025-12-21 09:44:43', 4, 'Committed by admin 4', '2025-12-21 09:38:33', '2025-12-21 09:44:43'),
(17, 21, 'blog', 'blogs', 18, 'create', NULL, '{\"title\":\"Smoke Test Blog\",\"content\":\"<p>Browser smoke test blog</p>\",\"status\":\"draft\",\"author_id\":21,\"thumbnail_url\":\"/asset/blog/1766309913651_smoke_blog.png\",\"content_type\":\"article\"}', 'committed', NULL, NULL, NULL, '2025-12-21 09:44:43', 4, 'Committed by admin 4', '2025-12-21 09:38:33', '2025-12-21 09:44:43'),
(18, 21, 'problem', 'problems', 119, 'create', NULL, '{\"problem_name\":\"E2E Problem by Faculty\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"End-to-end test problem\",\"sample_solution\":\"print(\'ok\')\",\"test_cases\":[{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"2\",\"ExpectedOutput\":\"2\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":2}],\"topics\":[3]}', 'committed', '2025-12-21 10:05:20', 21, 'Approved via script by user 21', '2025-12-21 10:05:36', 4, 'Committed by admin 4', '2025-12-21 10:04:53', '2025-12-21 10:05:36'),
(19, 21, 'problem', 'problems', 120, 'create', NULL, '{\"problem_name\":\"E2E Problem by Faculty\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"End-to-end test problem\",\"sample_solution\":\"print(\'ok\')\",\"test_cases\":[{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"2\",\"ExpectedOutput\":\"2\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":2}],\"topics\":[3]}', 'committed', '2025-12-21 10:12:58', 21, 'Approved via script by user 21', '2025-12-21 10:13:08', 4, 'Committed by admin 4', '2025-12-21 10:12:43', '2025-12-21 10:13:08'),
(20, 21, 'problem', 'problems', 121, 'create', NULL, '{\"problem_name\":\"E2E Problem Variation by Faculty\",\"difficulty\":\"Medium\",\"time_limit_seconds\":2,\"memory_limit_mb\":128,\"description\":\"End-to-end variation test problem\",\"sample_solution\":\"print(\'variant\')\",\"test_cases\":[{\"InputData\":\"10\",\"ExpectedOutput\":\"10\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"20\",\"ExpectedOutput\":\"20\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"30\",\"ExpectedOutput\":\"30\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":3}],\"topics\":[1,2]}', 'committed', '2025-12-21 10:18:04', 21, 'Approved via script by user 21', '2025-12-21 10:18:14', 4, 'Committed by admin 4', '2025-12-21 10:17:56', '2025-12-21 10:18:14'),
(21, 21, 'event', 'events', 31, 'create', NULL, '{\"event_name\":\"Smoke Test Event\",\"thumbnail_url\":\"/asset/event/1766314424447_smoke.png\",\"host_id\":21,\"reward_points\":10,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2025-12-21T11:53:44.421Z\",\"ends_at\":\"2025-12-21T12:53:44.423Z\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:01:21', 4, 'Auto-committed by script admin 4', '2025-12-21 10:53:44', '2025-12-21 11:01:21'),
(22, 21, 'blog', 'blogs', 19, 'create', NULL, '{\"title\":\"Smoke Test Blog\",\"content\":\"<p>This is a smoke test blog created by automated script</p>\",\"status\":\"draft\",\"author_id\":21,\"thumbnail_url\":\"/asset/blog/1766314424470_smoke_blog.png\",\"content_type\":\"article\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:01:21', 4, 'Auto-committed by script admin 4', '2025-12-21 10:53:44', '2025-12-21 11:01:21'),
(23, 21, 'problem', 'problems', 122, 'create', NULL, '{\"problem_name\":\"E2E Problem Variation by Faculty\",\"difficulty\":\"Medium\",\"time_limit_seconds\":2,\"memory_limit_mb\":128,\"description\":\"End-to-end variation test problem\",\"sample_solution\":\"print(\'variant\')\",\"test_cases\":[{\"InputData\":\"10\",\"ExpectedOutput\":\"10\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"20\",\"ExpectedOutput\":\"20\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"30\",\"ExpectedOutput\":\"30\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":3}],\"topics\":[1,2]}', 'committed', '2025-12-21 11:01:20', 21, 'Approved via script by user 21', '2025-12-21 11:01:21', 4, 'Committed by admin 4', '2025-12-21 10:59:56', '2025-12-21 11:01:21'),
(24, 21, 'event', 'events', 32, 'create', NULL, '{\"event_name\":\"Smoke Test Event\",\"thumbnail_url\":\"/asset/event/1766316082568_smoke.png\",\"host_id\":21,\"reward_points\":10,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2025-12-21T12:21:22.546Z\",\"ends_at\":\"2025-12-21T13:21:22.548Z\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:21:23', 4, 'Auto-committed by script admin 4', '2025-12-21 11:21:22', '2025-12-21 11:21:23'),
(25, 21, 'blog', 'blogs', 20, 'create', NULL, '{\"title\":\"Smoke Test Blog\",\"content\":\"<p>This is a smoke test blog created by automated script</p>\",\"status\":\"draft\",\"author_id\":21,\"thumbnail_url\":\"/asset/blog/1766316082587_smoke_blog.png\",\"content_type\":\"article\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:21:23', 4, 'Auto-committed by script admin 4', '2025-12-21 11:21:22', '2025-12-21 11:21:23'),
(26, 21, 'problem', 'problems', 123, 'create', NULL, '{\"problem_name\":\"E2E Problem Variation by Faculty\",\"difficulty\":\"Medium\",\"time_limit_seconds\":2,\"memory_limit_mb\":128,\"description\":\"End-to-end variation test problem\",\"sample_solution\":\"print(\'variant\')\",\"test_cases\":[{\"InputData\":\"10\",\"ExpectedOutput\":\"10\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"20\",\"ExpectedOutput\":\"20\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"30\",\"ExpectedOutput\":\"30\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":3}],\"topics\":[1,2]}', 'committed', '2025-12-21 11:21:23', 21, 'Approved via script by user 21', '2025-12-21 11:21:24', 4, 'Committed by admin 4', '2025-12-21 11:21:22', '2025-12-21 11:21:24'),
(27, 21, 'event', 'events', 33, 'create', NULL, '{\"event_name\":\"Smoke Test Event\",\"thumbnail_url\":\"/asset/event/1766316543377_smoke.png\",\"host_id\":21,\"reward_points\":10,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2025-12-21T12:29:03.364Z\",\"ends_at\":\"2025-12-21T13:29:03.366Z\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:29:04', 4, 'Auto-committed by script admin 4', '2025-12-21 11:29:03', '2025-12-21 11:29:04'),
(28, 21, 'blog', 'blogs', 21, 'create', NULL, '{\"title\":\"Smoke Test Blog\",\"content\":\"<p>This is a smoke test blog created by automated script</p>\",\"status\":\"draft\",\"author_id\":21,\"thumbnail_url\":\"/asset/blog/1766316543395_smoke_blog.png\",\"content_type\":\"article\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:29:04', 4, 'Auto-committed by script admin 4', '2025-12-21 11:29:03', '2025-12-21 11:29:04'),
(29, 21, 'problem', 'problems', 124, 'create', NULL, '{\"problem_name\":\"E2E Problem Variation by Faculty\",\"difficulty\":\"Medium\",\"time_limit_seconds\":2,\"memory_limit_mb\":128,\"description\":\"End-to-end variation test problem\",\"sample_solution\":\"print(\'variant\')\",\"test_cases\":[{\"InputData\":\"10\",\"ExpectedOutput\":\"10\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"20\",\"ExpectedOutput\":\"20\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"30\",\"ExpectedOutput\":\"30\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":3}],\"topics\":[1,2]}', 'committed', '2025-12-21 11:29:04', 21, 'Approved via script by user 21', '2025-12-21 11:29:04', 4, 'Committed by admin 4', '2025-12-21 11:29:03', '2025-12-21 11:29:04'),
(30, 21, 'event', 'events', 34, 'create', NULL, '{\"event_name\":\"Smoke Test Event\",\"thumbnail_url\":\"/asset/event/1766316570542_smoke.png\",\"host_id\":21,\"reward_points\":10,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2025-12-21T12:29:30.531Z\",\"ends_at\":\"2025-12-21T13:29:30.532Z\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:29:31', 4, 'Auto-committed by script admin 4', '2025-12-21 11:29:30', '2025-12-21 11:29:31'),
(31, 21, 'blog', 'blogs', 22, 'create', NULL, '{\"title\":\"Smoke Test Blog\",\"content\":\"<p>This is a smoke test blog created by automated script</p>\",\"status\":\"draft\",\"author_id\":21,\"thumbnail_url\":\"/asset/blog/1766316570557_smoke_blog.png\",\"content_type\":\"article\"}', 'committed', NULL, NULL, NULL, '2025-12-21 11:29:31', 4, 'Auto-committed by script admin 4', '2025-12-21 11:29:30', '2025-12-21 11:29:31'),
(32, 21, 'problem', 'problems', 125, 'create', NULL, '{\"problem_name\":\"E2E Problem Variation by Faculty\",\"difficulty\":\"Medium\",\"time_limit_seconds\":2,\"memory_limit_mb\":128,\"description\":\"End-to-end variation test problem\",\"sample_solution\":\"print(\'variant\')\",\"test_cases\":[{\"InputData\":\"10\",\"ExpectedOutput\":\"10\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"20\",\"ExpectedOutput\":\"20\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"30\",\"ExpectedOutput\":\"30\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":3}],\"topics\":[1,2]}', 'committed', '2025-12-21 11:29:31', 21, 'Approved via script by user 21', '2025-12-21 11:29:32', 4, 'Committed by admin 4', '2025-12-21 11:29:30', '2025-12-21 11:29:32'),
(33, 21, 'problem', 'problems', 0, 'create', NULL, '{\"problem_name\":\"Problem by faculty test 4\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"Testingaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4,2,6]}', 'rejected', '2026-01-03 06:05:06', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 11:37:25', '2026-01-03 06:05:06'),
(34, 21, 'event', 'events', 0, 'create', NULL, '{\"event_name\":\"event by faculty no.2\",\"thumbnail_url\":\"/asset/event/1766317164581_aa688d1a285f6600e6ba85f521634fb4.jpg\",\"host_id\":21,\"reward_points\":11,\"reward_level\":1111,\"status\":\"active\",\"starts_at\":\"2025-12-23T11:39:00.000Z\",\"ends_at\":\"2025-12-25T11:39:00.000Z\"}', 'rejected', '2026-01-03 07:53:57', 23, 'Denied by faculty', NULL, NULL, NULL, '2025-12-21 11:39:24', '2026-01-03 07:53:57'),
(35, 21, 'blog', 'blogs', 0, 'create', NULL, '{\"title\":\"blog by facult no.2\",\"content\":\"dsdksenfodurnhirehriutbertrhtg\",\"status\":\"draft\",\"author_id\":21,\"thumbnail_url\":\"/asset/blog/1766317204531_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-03 07:55:45', 23, 'Denied by faculty', NULL, NULL, NULL, '2025-12-21 11:40:04', '2026-01-03 07:55:45'),
(36, 7, 'problem', 'problems', 0, 'create', NULL, '{\"problem_name\":\"problem by faculty no.5\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"ssssssssssssssssssssssssssssssssssssssssssss\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4,2]}', 'rejected', '2026-01-03 06:05:04', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 12:12:11', '2026-01-03 06:05:04'),
(37, 7, 'problem', 'problems', 23, 'delete', '{\"problem_id\":23,\"problem_name\":\"Find the Maximum Number\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"Given a list of integers in a single line, print the largest number in the list.\",\"sample_solution\":null}', '{}', 'rejected', '2026-01-03 06:04:45', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 12:35:39', '2026-01-03 06:04:45'),
(38, 7, 'problem', 'problems', 23, 'delete', '{\"problem_id\":23,\"problem_name\":\"Find the Maximum Number\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"Given a list of integers in a single line, print the largest number in the list.\",\"sample_solution\":null}', '{}', 'rejected', '2026-01-03 06:05:00', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 12:35:43', '2026-01-03 06:05:00'),
(39, 7, 'problem', 'problems', 23, 'delete', '{\"problem_id\":23,\"problem_name\":\"Find the Maximum Number\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"Given a list of integers in a single line, print the largest number in the list.\",\"sample_solution\":null}', '{}', 'rejected', '2026-01-03 06:04:58', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 12:36:31', '2026-01-03 06:04:58'),
(40, 7, 'problem', 'problems', 96, 'delete', '{\"problem_id\":96,\"problem_name\":\"jjjjjjjjjjjjjjjjjjj\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj\",\"sample_solution\":\"print(\'j\')\"}', '{}', 'rejected', '2026-01-03 06:04:42', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 12:36:37', '2026-01-03 06:04:42'),
(42, 7, 'problem', 'problems', 0, 'create', NULL, '{\"problem_name\":\"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\",\"sample_solution\":\"print(\'r\')\",\"test_cases\":[{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":1},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":true,\"Score\":2,\"TestCaseNumber\":3},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"rr\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"r\",\"ExpectedOutput\":\"r\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4,5]}', 'rejected', '2026-01-03 06:05:08', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 12:39:30', '2026-01-03 06:05:08'),
(43, 7, 'event', 'events', 0, 'create', NULL, '{\"event_name\":\"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\",\"thumbnail_url\":\"/asset/event/1766320793750_bell.png\",\"host_id\":7,\"reward_points\":222,\"reward_level\":22222222,\"status\":\"active\",\"starts_at\":\"2025-12-30T12:39:00.000Z\",\"ends_at\":\"2025-12-31T12:39:00.000Z\"}', 'rejected', '2026-01-03 07:54:00', 23, 'Denied by faculty', NULL, NULL, NULL, '2025-12-21 12:39:53', '2026-01-03 07:54:00'),
(44, 7, 'blog', 'blogs', 0, 'create', NULL, '{\"title\":\"rrrrrrrrrrrr\",\"content\":\"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\",\"status\":\"draft\",\"author_id\":7,\"thumbnail_url\":\"/asset/blog/1766320812452_bell.png\",\"content_type\":\"Article\"}', 'rejected', '2026-01-03 07:55:33', 23, 'Denied by faculty', NULL, NULL, NULL, '2025-12-21 12:40:12', '2026-01-03 07:55:33'),
(45, 7, 'problem', 'problems', 96, 'delete', '{\"problem_id\":96,\"problem_name\":\"jjjjjjjjjjjjjjjjjjj\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj\",\"sample_solution\":\"print(\'j\')\"}', '{}', 'rejected', '2026-01-03 05:47:22', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2025-12-21 13:06:50', '2026-01-03 05:47:22'),
(46, 23, 'problem', 'problems', 130, 'update', '{\"problem_id\":130,\"problem_name\":\"problem by faculty 1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\"}', '{\"problem_name\":\"\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"\",\"sample_solution\":\"\",\"test_cases\":[],\"topics\":[]}', 'rejected', '2026-01-03 05:43:10', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 03:34:01', '2026-01-03 05:43:10'),
(48, 23, 'problem', 'problems', 0, 'create', NULL, '{\"problem_name\":\"problem by faculty 2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6,3]}', 'rejected', '2026-01-03 06:10:14', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 05:16:23', '2026-01-03 06:10:14'),
(49, 23, 'problem', 'problems', 130, 'delete', '{\"problem_id\":130,\"problem_name\":\"problem by faculty 1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\"}', '{}', 'rejected', '2026-01-03 05:43:07', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 05:16:36', '2026-01-03 05:43:07'),
(50, 23, 'problem', 'problems', 130, 'delete', '{\"problem_id\":130,\"problem_name\":\"problem by faculty 1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\"}', '{}', 'rejected', '2026-01-03 05:43:05', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 05:16:41', '2026-01-03 05:43:05'),
(51, 23, 'problem', 'problems', 130, 'delete', '{\"problem_id\":130,\"problem_name\":\"problem by faculty 1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\"}', '{}', 'rejected', '2026-01-03 05:43:03', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 05:17:22', '2026-01-03 05:43:03'),
(52, 23, 'event', 'events', 0, 'create', NULL, '{\"event_name\":\"event by faculty 1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-04T05:18:00.000Z\",\"ends_at\":\"2026-01-05T05:18:00.000Z\"}', 'rejected', '2026-01-03 05:42:58', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 05:18:59', '2026-01-03 05:42:58'),
(53, 23, 'blog', 'blogs', 0, 'create', NULL, '{\"title\":\"okokokok\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-03 05:46:49', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 05:20:15', '2026-01-03 05:46:49'),
(54, 23, 'problem', 'problems', 134, 'create', NULL, '{\"problem_name\":\"problem by faculty 4\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', '2026-01-03 08:31:24', 7, NULL, '2026-01-03 08:39:54', 4, 'Approved by admin', '2026-01-03 08:29:33', '2026-01-03 08:39:54'),
(55, 23, 'event', 'events', 44, 'create', NULL, '{\"event_name\":\"event by faculty 22\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T08:50:00.000Z\",\"ends_at\":\"2026-01-06T08:50:00.000Z\"}', 'committed', '2026-01-03 08:50:26', 7, NULL, '2026-01-03 08:53:55', 4, 'Approved by admin', '2026-01-03 08:50:11', '2026-01-03 08:53:55'),
(56, 23, 'blog', 'blogs', 33, 'create', NULL, '{\"title\":\"blog by faculty 2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-03 08:56:31', 7, NULL, '2026-01-03 09:45:17', 4, 'Rejected by admin', '2026-01-03 08:55:55', '2026-01-03 09:45:17'),
(57, 23, 'problem', 'problems', 135, 'create', NULL, '{\"problem_name\":\"problem by faculty 5\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6,3]}', 'committed', '2026-01-03 09:22:04', 7, NULL, '2026-01-03 09:22:30', 4, 'Approved by admin', '2026-01-03 09:18:25', '2026-01-03 09:22:30'),
(58, 23, 'problem', 'problems', 136, 'create', NULL, '{\"problem_name\":\"problem by faculty 6\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', '2026-01-03 09:46:53', 7, NULL, '2026-01-03 09:47:14', 4, 'Approved by admin', '2026-01-03 09:46:32', '2026-01-03 09:47:14'),
(59, 23, 'problem', 'problems', 137, 'create', NULL, '{\"problem_name\":\"problem by faculty 7\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":3,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4]}', 'committed', '2026-01-03 09:51:54', 7, NULL, '2026-01-03 09:52:08', 4, 'Approved by admin', '2026-01-03 09:48:39', '2026-01-03 09:52:08'),
(60, 23, 'problem', 'problems', 138, 'create', NULL, '{\"problem_name\":\"problem by faculty 10\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6]}', 'committed', '2026-01-03 10:44:20', 7, NULL, '2026-01-03 10:44:32', 4, 'Approved by admin', '2026-01-03 09:59:03', '2026-01-03 10:44:32'),
(61, 23, 'problem', 'problems', 0, 'create', NULL, '{\"problem_name\":\"problem by faculty 11\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6]}', 'rejected', '2026-01-03 10:55:12', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 09:59:11', '2026-01-03 10:55:12'),
(62, 23, 'event', 'events', 49, 'update', '{\"event_id\":49,\"event_name\":\"event by faculty 10\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-03T23:13:35.000Z\",\"status\":\"approved\"}', '{\"event_name\":\"event by faculty 10\",\"thumbnail_url\":null,\"reward_points\":0,\"reward_level\":0,\"status\":\"approved\",\"starts_at\":\"2026-01-04T15:13:00.000Z\",\"ends_at\":\"2026-01-05T15:13:00.000Z\"}', 'committed', '2026-01-03 23:31:56', 7, NULL, '2026-01-03 23:32:15', 4, 'Approved by admin', '2026-01-03 23:25:36', '2026-01-03 23:32:15'),
(63, 23, 'event', 'events', 50, 'update', '{\"event_id\":50,\"event_name\":\"event by faculty 11\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-03T23:13:40.000Z\",\"status\":\"approved\"}', '{\"event_name\":\"event by faculty 11\",\"thumbnail_url\":null,\"reward_points\":0,\"reward_level\":0,\"status\":\"approved\",\"starts_at\":\"2026-01-04T15:13:00.000Z\",\"ends_at\":\"2026-01-05T15:13:00.000Z\"}', 'rejected', '2026-01-04 00:01:42', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 23:25:43', '2026-01-04 00:01:42'),
(64, 23, 'blog', 'blogs', 36, 'update', '{\"blog_id\":36,\"author_id\":23,\"thumbnail_url\":null,\"title\":\"blog by faculty 12\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-03T23:13:55.000Z\",\"updated_at\":\"2026-01-03T23:15:28.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-03T23:13:55.000Z\"}', '{\"title\":\"blog by faculty 12\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-04 00:02:05', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 23:30:36', '2026-01-04 00:02:05'),
(65, 23, 'blog', 'blogs', 37, 'update', '{\"blog_id\":37,\"author_id\":23,\"thumbnail_url\":null,\"title\":\"blog by faculty 13\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-03T23:14:00.000Z\",\"updated_at\":\"2026-01-03T23:15:41.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-03T23:14:00.000Z\"}', '{\"title\":\"blog by faculty 13\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-04 00:02:09', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-03 23:30:38', '2026-01-04 00:02:09'),
(66, 23, 'problem', 'problems', 143, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6]}', 'committed', '2026-01-04 01:38:03', 7, NULL, '2026-01-04 01:38:55', 4, 'Approved by admin', '2026-01-04 01:35:40', '2026-01-04 01:38:55'),
(67, 23, 'event', 'events', 56, 'create', '{}', '{\"event_name\":\"bf1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T01:35:00.000Z\",\"ends_at\":\"2026-01-06T01:35:00.000Z\"}', 'committed', '2026-01-04 01:40:07', 7, NULL, '2026-01-04 01:40:18', 4, 'Approved by admin', '2026-01-04 01:35:59', '2026-01-04 01:40:18'),
(68, 23, 'blog', 'blogs', 43, 'create', '{}', '{\"title\":\"bbf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'committed', '2026-01-04 01:40:37', 7, NULL, '2026-01-04 01:40:53', 4, 'Approved by admin', '2026-01-04 01:36:15', '2026-01-04 01:40:53'),
(69, 23, 'problem', 'problems', 144, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[2]}', 'committed', '2026-01-04 01:51:52', 7, NULL, '2026-01-04 01:52:00', 4, 'Approved by admin', '2026-01-04 01:49:55', '2026-01-04 01:52:00'),
(70, 23, 'problem', 'problems', 145, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[2]}', 'committed', '2026-01-04 01:53:02', 7, NULL, '2026-01-04 01:54:29', 4, 'Approved by admin', '2026-01-04 01:50:03', '2026-01-04 01:54:29'),
(71, 23, 'event', 'events', 57, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T01:50:00.000Z\",\"ends_at\":\"2026-01-06T01:50:00.000Z\"}', 'committed', '2026-01-04 01:52:08', 7, NULL, '2026-01-04 01:54:29', 4, 'Approved by admin', '2026-01-04 01:50:26', '2026-01-04 01:54:29'),
(72, 23, 'event', 'events', 0, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T01:50:00.000Z\",\"ends_at\":\"2026-01-06T01:50:00.000Z\"}', 'rejected', '2026-01-04 11:15:38', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 01:50:33', '2026-01-04 11:15:38'),
(73, 23, 'blog', 'blogs', 0, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-04 10:32:08', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 01:51:42', '2026-01-04 10:32:08');
INSERT INTO `faculty_pending_changes` (`id`, `faculty_id`, `change_type`, `table_name`, `record_id`, `action_type`, `original_data`, `proposed_data`, `status`, `faculty_review_date`, `faculty_reviewer_id`, `faculty_review_comment`, `admin_review_date`, `admin_reviewer_id`, `admin_review_comment`, `created_at`, `updated_at`) VALUES
(74, 23, 'blog', 'blogs', 44, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'committed', '2026-01-04 01:52:14', 7, NULL, '2026-01-04 01:54:28', 4, 'Approved by admin', '2026-01-04 01:51:46', '2026-01-04 01:54:28'),
(75, 23, 'problem', 'problems', 0, 'create', '{}', '{\"problem_name\":\"pf3\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6]}', 'rejected', '2026-01-04 11:15:34', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 05:32:30', '2026-01-04 11:15:34'),
(76, 23, 'blog', 'blogs', 0, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-04 11:15:41', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 10:32:18', '2026-01-04 11:15:41'),
(77, 23, 'blog', 'blogs', 0, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767522772997_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-04 11:15:43', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 10:32:53', '2026-01-04 11:15:43'),
(78, 7, 'blog', 'blogs', 0, 'create', '{}', '{\"title\":\"bf3\",\"content\":\"aaaaaaaaaaaaaaaaaaaaassssssssssssssssssssss\",\"status\":\"draft\",\"author_id\":7,\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-05 00:04:41', 7, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 10:33:19', '2026-01-05 00:04:41'),
(79, 23, 'problem', 'problems', 0, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":3,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6]}', 'rejected', '2026-01-04 12:15:11', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 11:16:29', '2026-01-04 12:15:11'),
(80, 23, 'event', 'events', 0, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767525404022_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-04T11:16:00.000Z\",\"ends_at\":\"2026-01-05T11:16:00.000Z\"}', 'rejected', '2026-01-04 12:15:15', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 11:16:44', '2026-01-04 12:15:15'),
(81, 23, 'blog', 'blogs', 0, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767525427711_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-04 12:15:18', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 11:17:07', '2026-01-04 12:15:18'),
(82, 23, 'problem', 'problems', 0, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":2,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6]}', 'rejected', '2026-01-04 13:42:25', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 12:15:59', '2026-01-04 13:42:25'),
(83, 23, 'event', 'events', 58, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767534076828_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-04T13:41:00.000Z\",\"ends_at\":\"2026-01-05T13:41:00.000Z\"}', 'rejected', '2026-01-04 13:41:32', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 13:41:16', '2026-01-04 13:41:32'),
(84, 23, 'event', 'events', 59, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767534112509_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-04T13:41:00.000Z\",\"ends_at\":\"2026-01-05T13:41:00.000Z\"}', 'rejected', '2026-01-04 14:00:29', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 13:41:52', '2026-01-04 14:00:29'),
(85, 23, 'problem', 'problems', 146, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":2,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', NULL, NULL, NULL, '2026-01-04 13:44:57', 7, 'Approved via admin pending questions', '2026-01-04 13:43:29', '2026-01-04 13:44:57'),
(86, 23, 'blog', 'blogs', 45, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767534233970_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-04 14:00:35', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 13:43:53', '2026-01-04 14:00:35'),
(87, 23, 'problem', 'problems', 147, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', '2026-01-04 14:03:11', 7, NULL, '2026-01-04 14:05:55', 4, 'Approved by admin', '2026-01-04 14:01:23', '2026-01-04 14:05:55'),
(88, 23, 'event', 'events', 60, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767535305088_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-04T14:01:00.000Z\",\"ends_at\":\"2026-01-05T14:01:00.000Z\"}', 'committed', '2026-01-04 14:03:29', 7, NULL, '2026-01-04 14:05:54', 4, 'Approved by admin', '2026-01-04 14:01:45', '2026-01-04 14:05:54'),
(89, 23, 'blog', 'blogs', 46, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767535336948_robert.jpg\",\"content_type\":\"Article\"}', 'committed', '2026-01-04 14:03:40', 7, NULL, '2026-01-04 14:05:53', 4, 'Approved by admin', '2026-01-04 14:02:16', '2026-01-04 14:05:53'),
(90, 23, 'problem', 'problems', 148, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,2]}', 'committed', NULL, NULL, NULL, '2026-01-04 14:09:02', 4, 'Approved via admin pending questions', '2026-01-04 14:07:08', '2026-01-04 14:09:02'),
(91, 23, 'event', 'events', 61, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767535647204_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T14:07:00.000Z\",\"ends_at\":\"2026-01-06T14:07:00.000Z\"}', 'rejected', '2026-01-04 14:35:11', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 14:07:27', '2026-01-04 14:35:11'),
(92, 23, 'blog', 'blogs', 47, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767535662860_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-04 14:35:19', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 14:07:42', '2026-01-04 14:35:19'),
(93, 23, 'event', 'events', 62, 'create', '{}', '{\"event_name\":\"ef3\",\"thumbnail_url\":\"/asset/event/1767536552543_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T14:22:00.000Z\",\"ends_at\":\"2026-01-06T14:22:00.000Z\"}', 'committed', '2026-01-04 14:22:40', 7, NULL, '2026-01-04 14:23:16', 4, 'Approved by admin', '2026-01-04 14:22:32', '2026-01-04 14:23:16'),
(94, 23, 'event', 'events', 63, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767537370417_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T14:35:00.000Z\",\"ends_at\":\"2026-01-06T14:36:00.000Z\"}', 'committed', '2026-01-04 14:37:44', 7, NULL, '2026-01-04 14:38:30', 4, 'Approved by admin', '2026-01-04 14:36:10', '2026-01-04 14:38:30'),
(95, 23, 'blog', 'blogs', 48, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767537387917_robert.jpg\",\"content_type\":\"article\"}', 'committed', '2026-01-04 14:37:48', 7, NULL, '2026-01-04 14:38:29', 4, 'Approved by admin', '2026-01-04 14:36:27', '2026-01-04 14:38:29'),
(96, 23, 'event', 'events', 64, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767537407064_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-04T14:36:00.000Z\",\"ends_at\":\"2026-01-05T14:36:00.000Z\"}', 'committed', NULL, NULL, NULL, '2026-01-04 14:39:04', 4, 'Approved via admin event approval', '2026-01-04 14:36:47', '2026-01-04 14:39:04'),
(97, 23, 'blog', 'blogs', 49, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767537426561_robert.jpg\",\"content_type\":\"article\"}', 'committed', NULL, NULL, NULL, '2026-01-04 14:39:07', 4, 'Approved via admin blog approval', '2026-01-04 14:37:06', '2026-01-04 14:39:07'),
(98, 23, 'problem', 'problems', 149, 'create', '{}', '{\"problem_name\":\"pf3\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4]}', 'committed', NULL, NULL, NULL, '2026-01-04 14:40:31', 4, 'Approved via admin pending questions', '2026-01-04 14:40:19', '2026-01-04 14:40:31'),
(99, 23, 'event', 'events', 65, 'create', '{}', '{\"event_name\":\"ef3\",\"thumbnail_url\":\"/asset/event/1767567242043_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T22:53:00.000Z\",\"ends_at\":\"2026-01-06T22:53:00.000Z\"}', 'rejected', '2026-01-04 23:57:11', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 22:54:02', '2026-01-04 23:57:11'),
(100, 23, 'blog', 'blogs', 50, 'create', '{}', '{\"title\":\"bf3\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767567258289_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 00:04:51', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 22:54:18', '2026-01-05 00:04:51'),
(101, 23, 'problem', 'problems', 150, 'create', '{}', '{\"problem_name\":\"pf4\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\",\"sample_solution\":\"print(\'x\')\",\"test_cases\":[{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', '2026-01-04 23:04:19', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 22:55:28', '2026-01-04 23:04:19'),
(102, 23, 'problem', 'problems', 151, 'create', '{}', '{\"problem_name\":\"pf5\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\",\"sample_solution\":\"print(\'x\')\",\"test_cases\":[{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', '2026-01-04 23:09:45', 7, NULL, '2026-01-04 23:22:54', 4, 'Approved by admin', '2026-01-04 22:55:39', '2026-01-04 23:22:54'),
(103, 23, 'problem', 'problems', 152, 'create', '{}', '{\"problem_name\":\"pf6\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\",\"sample_solution\":\"print(\'x\')\",\"test_cases\":[{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"x\",\"ExpectedOutput\":\"x\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', '2026-01-04 23:56:38', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-04 22:55:42', '2026-01-04 23:56:38'),
(104, 23, 'problem', 'problems', 153, 'create', '{}', '{\"problem_name\":\"pf7\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', NULL, NULL, NULL, '2026-01-04 23:18:25', 4, 'Approved via admin pending questions', '2026-01-04 23:18:06', '2026-01-04 23:18:25'),
(105, 23, 'problem', 'problems', 154, 'create', '{}', '{\"problem_name\":\"pf8\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', '2026-01-04 23:22:24', 7, NULL, '2026-01-05 03:45:46', 4, 'Approved by admin', '2026-01-04 23:18:12', '2026-01-05 03:45:46'),
(106, 23, 'problem', 'problems', 155, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,2]}', 'committed', '2026-01-05 03:49:52', 7, NULL, '2026-01-05 03:50:44', 4, 'Approved by admin', '2026-01-05 00:07:15', '2026-01-05 03:50:44'),
(107, 23, 'problem', 'problems', 156, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,2]}', 'committed', NULL, NULL, NULL, '2026-01-05 03:57:16', 4, 'Approved via admin pending questions', '2026-01-05 00:07:17', '2026-01-05 03:57:16'),
(108, 23, 'problem', 'problems', 157, 'create', '{}', '{\"problem_name\":\"pf3\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,2]}', 'rejected', '2026-01-05 11:13:46', 7, 'problem no 3', NULL, NULL, NULL, '2026-01-05 00:07:21', '2026-01-05 11:13:46'),
(109, 23, 'problem', 'problems', 158, 'create', '{}', '{\"problem_name\":\"pf4\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,2]}', 'rejected', '2026-01-05 11:20:50', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 00:07:24', '2026-01-05 11:20:50'),
(110, 23, 'problem', 'problems', 159, 'create', '{}', '{\"problem_name\":\"pf5\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,2]}', 'rejected', '2026-01-05 12:09:48', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 00:07:26', '2026-01-05 12:09:48'),
(111, 23, 'problem', 'problems', 160, 'create', '{}', '{\"problem_name\":\"pf6\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,2]}', 'rejected', '2026-01-05 12:08:55', 7, 'pf6 is soooo bad', NULL, NULL, NULL, '2026-01-05 00:07:28', '2026-01-05 12:08:55'),
(112, 23, 'event', 'events', 66, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767571670409_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T00:07:00.000Z\",\"ends_at\":\"2026-01-06T00:07:00.000Z\"}', 'committed', '2026-01-05 03:50:11', 7, NULL, '2026-01-05 03:50:43', 4, 'Approved by admin', '2026-01-05 00:07:50', '2026-01-05 03:50:43'),
(113, 23, 'event', 'events', 67, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767571674631_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T00:07:00.000Z\",\"ends_at\":\"2026-01-06T00:07:00.000Z\"}', 'committed', '2026-01-05 11:25:15', 7, NULL, '2026-01-05 12:57:36', 4, 'Approved by admin', '2026-01-05 00:07:54', '2026-01-05 12:57:36'),
(114, 23, 'event', 'events', 68, 'create', '{}', '{\"event_name\":\"ef3\",\"thumbnail_url\":\"/asset/event/1767571677990_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T00:07:00.000Z\",\"ends_at\":\"2026-01-06T00:07:00.000Z\"}', 'rejected', '2026-01-05 11:14:08', 7, 'event no 3', NULL, NULL, NULL, '2026-01-05 00:07:57', '2026-01-05 11:14:08'),
(115, 23, 'event', 'events', 69, 'create', '{}', '{\"event_name\":\"ef4\",\"thumbnail_url\":\"/asset/event/1767571681557_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T00:07:00.000Z\",\"ends_at\":\"2026-01-06T00:07:00.000Z\"}', 'rejected', '2026-01-05 13:32:43', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 00:08:01', '2026-01-05 13:32:43'),
(116, 23, 'event', 'events', 70, 'create', '{}', '{\"event_name\":\"ef5\",\"thumbnail_url\":\"/asset/event/1767571685637_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-05T00:07:00.000Z\",\"ends_at\":\"2026-01-06T00:07:00.000Z\"}', 'committed', NULL, NULL, NULL, '2026-01-05 03:57:27', 4, 'Approved via admin event approval', '2026-01-05 00:08:05', '2026-01-05 03:57:27'),
(117, 23, 'blog', 'blogs', 51, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767571709653_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'committed', '2026-01-05 03:50:25', 7, NULL, '2026-01-05 03:50:43', 4, 'Approved by admin', '2026-01-05 00:08:29', '2026-01-05 03:50:43'),
(118, 23, 'blog', 'blogs', 52, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767571712990_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'committed', NULL, NULL, NULL, '2026-01-05 03:57:46', 4, 'Approved via admin blog approval', '2026-01-05 00:08:32', '2026-01-05 03:57:46'),
(119, 23, 'blog', 'blogs', 53, 'create', '{}', '{\"title\":\"bf3\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767571716395_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 11:14:24', 7, 'blog no 3', NULL, NULL, NULL, '2026-01-05 00:08:36', '2026-01-05 11:14:24'),
(120, 23, 'blog', 'blogs', 54, 'create', '{}', '{\"title\":\"bf4\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767571719756_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 11:25:31', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 00:08:39', '2026-01-05 11:25:31'),
(121, 23, 'event', 'events', 35, 'delete', '{\"event_id\":35,\"event_name\":\"blog by admin\",\"thumbnail_url\":\"/asset/event/blog-by-admin.png\",\"host_id\":4,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2025-12-28T09:59:10.000Z\",\"status\":\"\"}', '{}', 'committed', NULL, NULL, NULL, '2026-01-05 03:33:22', 4, 'Approved by admin', '2026-01-05 03:32:27', '2026-01-05 03:33:22'),
(122, 23, 'event', 'events', 36, 'delete', '{\"event_id\":36,\"event_name\":\"blog by admin 2\",\"thumbnail_url\":\"/asset/event/blog-by-admin-2.png\",\"host_id\":4,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2025-12-28T09:59:49.000Z\",\"status\":\"\"}', '{}', 'committed', NULL, NULL, NULL, '2026-01-05 03:33:20', 4, 'Approved by admin', '2026-01-05 03:32:36', '2026-01-05 03:33:20'),
(123, 23, 'blog', 'blogs', 52, 'update', '{\"blog_id\":52,\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767571712990_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T00:08:33.000Z\",\"updated_at\":\"2026-01-05T03:57:46.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T00:08:33.000Z\"}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaadddddddddddd\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-05 03:59:59', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 03:58:26', '2026-01-05 03:59:59'),
(124, 23, 'event', 'events', 70, 'update', '{\"event_id\":70,\"event_name\":\"ef5\",\"thumbnail_url\":\"/asset/event/1767571685637_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-05T00:08:05.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef5\",\"thumbnail_url\":null,\"reward_points\":0,\"reward_level\":0,\"status\":\"\",\"starts_at\":\"2026-01-04T16:07:00.000Z\",\"ends_at\":\"2026-01-05T16:07:00.000Z\"}', 'rejected', '2026-01-05 04:01:44', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 04:01:39', '2026-01-05 04:01:44'),
(125, 23, 'event', 'events', 70, 'update', '{\"event_id\":70,\"event_name\":\"ef5\",\"thumbnail_url\":\"/asset/event/1767571685637_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-05T00:08:05.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef5\",\"thumbnail_url\":null,\"reward_points\":0,\"reward_level\":0,\"status\":\"\",\"starts_at\":\"2026-01-04T16:07:00.000Z\",\"ends_at\":\"2026-01-05T16:07:00.000Z\"}', 'rejected', '2026-01-05 12:16:46', 7, 'ef5 sukx', NULL, NULL, NULL, '2026-01-05 11:00:46', '2026-01-05 12:16:46'),
(126, 23, 'blog', 'blogs', 52, 'update', '{\"blog_id\":52,\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767571712990_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T00:08:33.000Z\",\"updated_at\":\"2026-01-05T03:57:46.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T00:08:33.000Z\"}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-05 12:44:41', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 11:01:00', '2026-01-05 12:44:41'),
(127, 23, 'problem', 'problems', 161, 'create', '{}', '{\"problem_name\":\"pf7\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6]}', 'rejected', '2026-01-05 12:29:03', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:28:43', '2026-01-05 12:29:03'),
(128, 23, 'problem', 'problems', 162, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', '2026-01-05 12:48:58', 7, 'pf1 bro', NULL, NULL, NULL, '2026-01-05 12:42:43', '2026-01-05 12:48:58');
INSERT INTO `faculty_pending_changes` (`id`, `faculty_id`, `change_type`, `table_name`, `record_id`, `action_type`, `original_data`, `proposed_data`, `status`, `faculty_review_date`, `faculty_reviewer_id`, `faculty_review_comment`, `admin_review_date`, `admin_reviewer_id`, `admin_review_comment`, `created_at`, `updated_at`) VALUES
(129, 23, 'problem', 'problems', 163, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', NULL, NULL, NULL, '2026-01-05 12:53:59', 4, 'Denied via admin pending questions', '2026-01-05 12:42:52', '2026-01-05 12:53:59'),
(130, 23, 'problem', 'problems', 164, 'create', '{}', '{\"problem_name\":\"pf3\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', NULL, NULL, NULL, '2026-01-05 13:03:14', 4, 'Denied via admin pending questions', '2026-01-05 12:42:54', '2026-01-05 13:03:14'),
(131, 23, 'problem', 'problems', 165, 'create', '{}', '{\"problem_name\":\"pf4\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', NULL, NULL, NULL, '2026-01-05 13:25:08', 4, 'Denied via admin pending questions', '2026-01-05 12:42:57', '2026-01-05 13:25:08'),
(132, 23, 'problem', 'problems', 166, 'create', '{}', '{\"problem_name\":\"pf5\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', '2026-01-05 13:25:26', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:42:59', '2026-01-05 13:25:26'),
(133, 23, 'problem', 'problems', 167, 'create', '{}', '{\"problem_name\":\"pf6\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', '2026-01-05 13:32:33', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 12:43:01', '2026-01-05 13:32:33'),
(134, 23, 'problem', 'problems', 168, 'create', '{}', '{\"problem_name\":\"pf7\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', '2026-01-05 13:41:28', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:43:06', '2026-01-05 13:41:28'),
(135, 23, 'problem', 'problems', 169, 'create', '{}', '{\"problem_name\":\"pf8\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', NULL, NULL, NULL, '2026-01-05 13:42:13', 4, 'Denied via admin pending questions', '2026-01-05 12:43:09', '2026-01-05 13:42:13'),
(136, 23, 'problem', 'problems', 170, 'create', '{}', '{\"problem_name\":\"pf9\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'rejected', '2026-01-05 13:44:18', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 12:43:13', '2026-01-05 13:44:18'),
(137, 23, 'event', 'events', 71, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767617016809_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1000,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-05T12:43:00.000Z\",\"ends_at\":\"2026-01-06T12:43:00.000Z\"}', 'rejected', '2026-01-05 12:55:17', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:43:36', '2026-01-05 12:55:17'),
(138, 23, 'event', 'events', 72, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767617022727_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1000,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-05T12:43:00.000Z\",\"ends_at\":\"2026-01-06T12:43:00.000Z\"}', 'rejected', '2026-01-05 12:58:28', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:43:42', '2026-01-05 12:58:28'),
(139, 23, 'event', 'events', 73, 'create', '{}', '{\"event_name\":\"ef3\",\"thumbnail_url\":\"/asset/event/1767617026850_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1000,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-05T12:43:00.000Z\",\"ends_at\":\"2026-01-06T12:43:00.000Z\"}', 'rejected', '2026-01-05 13:00:30', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:43:46', '2026-01-05 13:00:30'),
(140, 23, 'event', 'events', 74, 'create', '{}', '{\"event_name\":\"ef4\",\"thumbnail_url\":\"/asset/event/1767617030510_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1000,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-05T12:43:00.000Z\",\"ends_at\":\"2026-01-06T12:43:00.000Z\"}', 'rejected', '2026-01-05 12:44:30', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 12:43:50', '2026-01-05 12:44:30'),
(141, 23, 'event', 'events', 75, 'create', '{}', '{\"event_name\":\"ef5\",\"thumbnail_url\":\"/asset/event/1767617035372_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1000,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-05T12:43:00.000Z\",\"ends_at\":\"2026-01-06T12:43:00.000Z\"}', 'rejected', '2026-01-05 13:44:02', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 12:43:55', '2026-01-05 13:44:02'),
(142, 23, 'event', 'events', 76, 'create', '{}', '{\"event_name\":\"ef6\",\"thumbnail_url\":\"/asset/event/1767617038991_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1000,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-05T12:43:00.000Z\",\"ends_at\":\"2026-01-06T12:43:00.000Z\"}', 'rejected', '2026-01-05 13:28:04', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:43:59', '2026-01-05 13:28:04'),
(143, 23, 'event', 'events', 77, 'create', '{}', '{\"event_name\":\"ef7\",\"thumbnail_url\":\"/asset/event/1767617043400_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1000,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-05T12:43:00.000Z\",\"ends_at\":\"2026-01-06T12:43:00.000Z\"}', 'rejected', '2026-01-05 13:41:37', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:44:03', '2026-01-05 13:41:37'),
(144, 23, 'blog', 'blogs', 55, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767617103179_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 13:44:23', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 12:45:03', '2026-01-05 13:44:23'),
(145, 23, 'blog', 'blogs', 56, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767617107244_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 13:05:03', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:45:07', '2026-01-05 13:05:03'),
(146, 23, 'blog', 'blogs', 57, 'create', '{}', '{\"title\":\"bf3\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767617110712_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 13:44:25', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 12:45:10', '2026-01-05 13:44:25'),
(147, 23, 'blog', 'blogs', 58, 'create', '{}', '{\"title\":\"bf4\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767617114368_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 13:30:44', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:45:14', '2026-01-05 13:30:44'),
(148, 23, 'blog', 'blogs', 59, 'create', '{}', '{\"title\":\"bf5\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767617117510_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 13:32:53', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 12:45:17', '2026-01-05 13:32:53'),
(149, 23, 'blog', 'blogs', 60, 'create', '{}', '{\"title\":\"bf6\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767617121644_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', NULL, NULL, NULL, '2026-01-05 13:42:59', 4, 'Denied in admin pending blogs', '2026-01-05 12:45:21', '2026-01-05 13:42:59'),
(150, 23, 'blog', 'blogs', 61, 'create', '{}', '{\"title\":\"bf7\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767617125877_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 13:41:42', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-05 12:45:25', '2026-01-05 13:41:42'),
(151, 23, 'event', 'events', 78, 'create', '{}', '{\"event_name\":\"ef9\",\"thumbnail_url\":\"/asset/event/1767620622926_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-06T13:43:00.000Z\",\"ends_at\":\"2026-01-07T13:43:00.000Z\"}', 'rejected', NULL, NULL, NULL, '2026-01-05 13:43:50', 4, 'Denied in admin pending events', '2026-01-05 13:43:42', '2026-01-05 13:43:50'),
(152, 23, 'problem', 'problems', 171, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6,3,5,2,4,1]}', 'committed', '2026-01-05 14:17:02', 7, NULL, '2026-01-05 14:18:41', 4, 'Approved by admin', '2026-01-05 14:15:32', '2026-01-05 14:18:41'),
(153, 23, 'problem', 'problems', 172, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6,3,5,2,4,1]}', 'rejected', '2026-01-05 14:40:09', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 14:15:34', '2026-01-05 14:40:09'),
(154, 23, 'problem', 'problems', 173, 'create', '{}', '{\"problem_name\":\"pf3\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6,3,5,2,4,1]}', 'rejected', '2026-01-05 14:40:12', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 14:15:37', '2026-01-05 14:40:12'),
(155, 23, 'problem', 'problems', 174, 'create', '{}', '{\"problem_name\":\"pf4\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6,3,5,2,4,1]}', 'rejected', '2026-01-05 14:40:15', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 14:15:40', '2026-01-05 14:40:15'),
(156, 23, 'problem', 'problems', 175, 'create', '{}', '{\"problem_name\":\"pf5\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[6,3,5,2,4,1]}', 'committed', NULL, NULL, NULL, '2026-01-05 14:17:43', 4, 'Approved via admin pending questions', '2026-01-05 14:15:43', '2026-01-05 14:17:43'),
(157, 23, 'event', 'events', 79, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767622565577_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":20,\"reward_level\":11,\"status\":\"active\",\"starts_at\":\"2026-01-06T14:15:00.000Z\",\"ends_at\":\"2026-01-07T14:15:00.000Z\"}', 'committed', NULL, NULL, NULL, '2026-01-05 14:38:53', 4, 'Approved via admin approvals tab', '2026-01-05 14:16:05', '2026-01-05 14:38:53'),
(158, 23, 'event', 'events', 80, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767622569796_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":20,\"reward_level\":11,\"status\":\"active\",\"starts_at\":\"2026-01-06T14:15:00.000Z\",\"ends_at\":\"2026-01-07T14:15:00.000Z\"}', 'committed', '2026-01-05 14:17:06', 7, NULL, '2026-01-05 14:18:42', 4, 'Approved by admin', '2026-01-05 14:16:09', '2026-01-05 14:18:42'),
(159, 23, 'event', 'events', 81, 'create', '{}', '{\"event_name\":\"ef3\",\"thumbnail_url\":\"/asset/event/1767622574612_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":20,\"reward_level\":11,\"status\":\"active\",\"starts_at\":\"2026-01-06T14:15:00.000Z\",\"ends_at\":\"2026-01-07T14:15:00.000Z\"}', 'rejected', '2026-01-05 14:40:26', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 14:16:14', '2026-01-05 14:40:26'),
(160, 23, 'event', 'events', 82, 'create', '{}', '{\"event_name\":\"ef4\",\"thumbnail_url\":\"/asset/event/1767622578650_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":20,\"reward_level\":11,\"status\":\"active\",\"starts_at\":\"2026-01-06T14:15:00.000Z\",\"ends_at\":\"2026-01-07T14:15:00.000Z\"}', 'rejected', '2026-01-05 14:40:29', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 14:16:18', '2026-01-05 14:40:29'),
(161, 23, 'event', 'events', 83, 'create', '{}', '{\"event_name\":\"ef5\",\"thumbnail_url\":\"/asset/event/1767622582265_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":20,\"reward_level\":11,\"status\":\"active\",\"starts_at\":\"2026-01-06T14:15:00.000Z\",\"ends_at\":\"2026-01-07T14:15:00.000Z\"}', 'committed', NULL, NULL, NULL, '2026-01-05 14:17:50', 4, 'Approved via admin event approval', '2026-01-05 14:16:22', '2026-01-05 14:17:50'),
(162, 23, 'blog', 'blogs', 62, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"asdsdsdsdsdsdadadasdsds\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767622599234_robert.jpg\",\"content_type\":\"Article\"}', 'committed', NULL, NULL, NULL, '2026-01-05 14:38:56', 4, 'Approved via admin approvals tab', '2026-01-05 14:16:39', '2026-01-05 14:38:56'),
(163, 23, 'blog', 'blogs', 63, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"asdsdsdsdsdsdadadasdsds\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767622602688_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 14:40:37', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 14:16:42', '2026-01-05 14:40:37'),
(164, 23, 'blog', 'blogs', 64, 'create', '{}', '{\"title\":\"bf3\",\"content\":\"asdsdsdsdsdsdadadasdsds\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767622606199_robert.jpg\",\"content_type\":\"Article\"}', 'committed', '2026-01-05 14:17:11', 7, NULL, '2026-01-05 14:18:43', 4, 'Approved by admin', '2026-01-05 14:16:46', '2026-01-05 14:18:43'),
(165, 23, 'blog', 'blogs', 65, 'create', '{}', '{\"title\":\"bf4\",\"content\":\"asdsdsdsdsdsdadadasdsds\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767622609495_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-05 14:40:39', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-05 14:16:49', '2026-01-05 14:40:39'),
(166, 23, 'blog', 'blogs', 66, 'create', '{}', '{\"title\":\"bf5\",\"content\":\"asdsdsdsdsdsdadadasdsds\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767622612958_robert.jpg\",\"content_type\":\"Article\"}', 'committed', NULL, NULL, NULL, '2026-01-05 14:17:53', 4, 'Approved via admin blog approval', '2026-01-05 14:16:52', '2026-01-05 14:17:53'),
(167, 23, 'problem', 'problems', 176, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4]}', 'committed', NULL, NULL, NULL, '2026-01-05 15:12:29', 4, 'Approved via admin approvals tab', '2026-01-05 14:42:01', '2026-01-05 15:12:29'),
(168, 23, 'problem', 'problems', 177, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4]}', 'rejected', NULL, NULL, NULL, '2026-01-05 15:12:31', 4, 'Denied in admin approvals tab', '2026-01-05 14:42:04', '2026-01-05 15:12:31'),
(169, 23, 'event', 'events', 84, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767624145129_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-06T14:42:00.000Z\",\"ends_at\":\"2026-01-07T14:42:00.000Z\"}', 'committed', NULL, NULL, NULL, '2026-01-05 14:43:01', 4, 'Approved via admin approvals tab', '2026-01-05 14:42:25', '2026-01-05 14:43:01'),
(170, 23, 'event', 'events', 85, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767624151688_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"status\":\"active\",\"starts_at\":\"2026-01-06T14:42:00.000Z\",\"ends_at\":\"2026-01-07T14:42:00.000Z\"}', 'rejected', NULL, NULL, NULL, '2026-01-05 14:43:09', 4, 'Denied in admin approvals tab', '2026-01-05 14:42:31', '2026-01-05 14:43:09'),
(171, 23, 'blog', 'blogs', 67, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767624164765_robert.jpg\",\"content_type\":\"Article\"}', 'committed', NULL, NULL, NULL, '2026-01-05 14:43:03', 4, 'Approved via admin approvals tab', '2026-01-05 14:42:44', '2026-01-05 14:43:03'),
(172, 23, 'blog', 'blogs', 68, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767624168402_robert.jpg\",\"content_type\":\"Article\"}', 'rejected', NULL, NULL, NULL, '2026-01-05 14:43:12', 4, 'Denied in admin approvals tab', '2026-01-05 14:42:48', '2026-01-05 14:43:12'),
(173, 23, 'event', 'events', 85, 'update', '{\"event_id\":85,\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767624151688_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2026-01-05T14:42:31.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef2\",\"thumbnail_url\":null,\"reward_points\":1,\"reward_level\":1,\"status\":\"\",\"starts_at\":\"2026-01-06T06:42:00.000Z\",\"ends_at\":\"2026-01-07T06:42:00.000Z\"}', 'committed', '2026-01-06 01:08:00', 7, NULL, '2026-01-06 01:26:12', 4, 'Approved by admin', '2026-01-05 15:50:10', '2026-01-06 01:26:12'),
(174, 23, 'blog', 'blogs', 68, 'update', '{\"blog_id\":68,\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767624168402_robert.jpg\",\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T14:42:48.000Z\",\"updated_at\":\"2026-01-05T14:43:12.000Z\",\"status\":\"\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T14:42:48.000Z\"}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'committed', '2026-01-05 17:21:32', 7, NULL, '2026-01-06 01:26:12', 4, 'Approved by admin', '2026-01-05 15:50:54', '2026-01-06 01:26:12'),
(175, 23, 'event', 'events', 84, 'update', '{\"event_id\":84,\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767624145129_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2026-01-05T14:42:25.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef1\",\"thumbnail_url\":null,\"reward_points\":1,\"reward_level\":1,\"status\":\"\",\"starts_at\":\"2026-01-06T06:42:00.000Z\",\"ends_at\":\"2026-01-07T06:42:00.000Z\"}', 'committed', '2026-01-06 01:28:54', 7, NULL, '2026-01-06 01:29:15', 4, 'Approved by admin', '2026-01-06 01:27:45', '2026-01-06 01:29:15'),
(176, 23, 'blog', 'blogs', 67, 'update', '{\"blog_id\":67,\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767624164765_robert.jpg\",\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T14:42:44.000Z\",\"updated_at\":\"2026-01-05T14:43:03.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T14:42:44.000Z\"}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'committed', '2026-01-06 01:28:56', 7, NULL, '2026-01-06 01:29:14', 4, 'Approved by admin', '2026-01-06 01:27:52', '2026-01-06 01:29:14'),
(177, 23, 'event', 'events', 84, 'update', '{\"event_id\":84,\"event_name\":\"ef1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2026-01-05T14:42:25.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef1\",\"thumbnail_url\":null,\"reward_points\":1,\"reward_level\":1,\"status\":\"\",\"starts_at\":\"2026-01-06T06:42:00.000Z\",\"ends_at\":\"2026-01-07T06:42:00.000Z\"}', 'rejected', '2026-01-06 01:30:05', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-06 01:29:48', '2026-01-06 01:30:05'),
(178, 23, 'blog', 'blogs', 67, 'update', '{\"blog_id\":67,\"author_id\":23,\"thumbnail_url\":null,\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T14:42:44.000Z\",\"updated_at\":\"2026-01-06T01:29:14.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T14:42:44.000Z\"}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-06 01:30:09', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-06 01:29:53', '2026-01-06 01:30:09'),
(179, 23, 'event', 'events', 84, 'update', '{\"event_id\":84,\"event_name\":\"ef1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2026-01-05T14:42:25.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef1\",\"thumbnail_url\":null,\"reward_points\":1,\"reward_level\":1,\"status\":\"\",\"starts_at\":\"2026-01-06T06:42:00.000Z\",\"ends_at\":\"2026-01-07T06:42:00.000Z\"}', 'committed', '2026-01-06 01:55:11', 7, NULL, '2026-01-06 01:55:31', 4, 'Approved by admin', '2026-01-06 01:53:19', '2026-01-06 01:55:31'),
(180, 23, 'blog', 'blogs', 67, 'update', '{\"blog_id\":67,\"author_id\":23,\"thumbnail_url\":null,\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T14:42:44.000Z\",\"updated_at\":\"2026-01-06T01:29:14.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T14:42:44.000Z\"}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'committed', '2026-01-06 01:55:14', 7, NULL, '2026-01-06 01:55:30', 4, 'Approved by admin', '2026-01-06 01:53:23', '2026-01-06 01:55:30'),
(181, 23, 'problem', 'problems', 178, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', '2026-01-06 01:55:16', 7, NULL, '2026-01-06 01:55:30', 4, 'Approved by admin', '2026-01-06 01:54:37', '2026-01-06 01:55:30'),
(182, 23, 'event', 'events', 84, 'update', '{\"event_id\":84,\"event_name\":\"ef1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2026-01-05T14:42:25.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef1\",\"thumbnail_url\":null,\"reward_points\":1,\"reward_level\":1,\"status\":\"\",\"starts_at\":\"2026-01-06T06:42:00.000Z\",\"ends_at\":\"2026-01-07T06:42:00.000Z\"}', 'rejected', '2026-01-06 01:56:31', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-06 01:56:15', '2026-01-06 01:56:31'),
(183, 23, 'blog', 'blogs', 67, 'update', '{\"blog_id\":67,\"author_id\":23,\"thumbnail_url\":null,\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T14:42:44.000Z\",\"updated_at\":\"2026-01-06T01:29:14.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T14:42:44.000Z\"}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-06 01:56:34', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-06 01:56:20', '2026-01-06 01:56:34'),
(184, 23, 'event', 'events', 84, 'update', '{\"event_id\":84,\"event_name\":\"ef1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2026-01-05T14:42:25.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef1\",\"thumbnail_url\":null,\"reward_points\":1,\"reward_level\":1,\"status\":\"\",\"starts_at\":\"2026-01-06T06:42:00.000Z\",\"ends_at\":\"2026-01-07T06:42:00.000Z\"}', 'committed', '2026-01-06 03:01:13', 7, NULL, '2026-01-06 03:02:07', 4, 'Approved by admin', '2026-01-06 02:10:57', '2026-01-06 03:02:07'),
(185, 23, 'blog', 'blogs', 67, 'update', '{\"blog_id\":67,\"author_id\":23,\"thumbnail_url\":null,\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T14:42:44.000Z\",\"updated_at\":\"2026-01-06T01:29:14.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T14:42:44.000Z\"}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'committed', '2026-01-06 03:01:15', 7, NULL, '2026-01-06 03:02:06', 4, 'Approved by admin', '2026-01-06 02:11:01', '2026-01-06 03:02:06'),
(186, 23, 'problem', 'problems', 179, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"aa\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[3]}', 'committed', '2026-01-06 02:39:12', 7, NULL, '2026-01-06 02:39:29', 4, 'Approved by admin', '2026-01-06 02:35:53', '2026-01-06 02:39:29'),
(187, 23, 'blog', 'blogs', 69, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"ssssssssssss\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767667015372_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'rejected', '2026-01-06 03:01:24', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-06 02:36:55', '2026-01-06 03:01:24');
INSERT INTO `faculty_pending_changes` (`id`, `faculty_id`, `change_type`, `table_name`, `record_id`, `action_type`, `original_data`, `proposed_data`, `status`, `faculty_review_date`, `faculty_reviewer_id`, `faculty_review_comment`, `admin_review_date`, `admin_reviewer_id`, `admin_review_comment`, `created_at`, `updated_at`) VALUES
(188, 23, 'problem', 'problems', 180, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'1\')\",\"test_cases\":[{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"11\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4]}', 'committed', '2026-01-06 03:01:17', 7, NULL, '2026-01-06 03:02:06', 4, 'Approved by admin', '2026-01-06 02:50:40', '2026-01-06 03:02:06'),
(189, 23, 'problem', 'problems', 181, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'1\')\",\"test_cases\":[{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"11\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"1\",\"ExpectedOutput\":\"1\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1,4]}', 'rejected', '2026-01-06 03:01:26', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-06 02:50:46', '2026-01-06 03:01:26'),
(190, 23, 'event', 'events', 86, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767668455263_robert.jpg\",\"host_id\":23,\"reward_points\":0,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-07T03:00:00.000Z\",\"ends_at\":\"2026-01-08T03:00:00.000Z\"}', 'rejected', '2026-01-06 03:01:21', 7, 'Denied by faculty', NULL, NULL, NULL, '2026-01-06 03:00:55', '2026-01-06 03:01:21'),
(191, 23, 'event', 'events', 84, 'update', '{\"event_id\":84,\"event_name\":\"ef1\",\"thumbnail_url\":null,\"host_id\":23,\"reward_points\":1,\"reward_level\":1,\"created_at\":\"2026-01-05T14:42:25.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef1\",\"thumbnail_url\":null,\"reward_points\":1,\"reward_level\":1,\"status\":\"\",\"starts_at\":\"2026-01-06T06:42:00.000Z\",\"ends_at\":\"2026-01-07T06:42:00.000Z\"}', 'rejected', '2026-01-06 03:22:55', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-06 03:02:37', '2026-01-06 03:22:55'),
(192, 23, 'blog', 'blogs', 67, 'update', '{\"blog_id\":67,\"author_id\":23,\"thumbnail_url\":null,\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-05T14:42:44.000Z\",\"updated_at\":\"2026-01-06T01:29:14.000Z\",\"status\":\"approved\",\"content_type\":\"Article\",\"created_at\":\"2026-01-05T14:42:44.000Z\"}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"status\":\"approved\",\"thumbnail_url\":null,\"content_type\":\"Article\"}', 'rejected', '2026-01-06 03:23:01', 23, 'Cancelled by faculty', NULL, NULL, NULL, '2026-01-06 03:02:41', '2026-01-06 03:23:01'),
(193, 23, 'problem', 'problems', 183, 'create', '{}', '{\"problem_name\":\"pf1\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'committed', '2026-01-06 03:27:43', 7, NULL, '2026-01-06 03:27:51', 4, 'Approved by admin', '2026-01-06 03:24:42', '2026-01-06 03:27:51'),
(194, 23, 'problem', 'problems', 184, 'create', '{}', '{\"problem_name\":\"pf2\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"sample_solution\":\"print(\'a\')\",\"test_cases\":[{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":1,\"TestCaseNumber\":1},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":2},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":true,\"Score\":0,\"TestCaseNumber\":3},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":4},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":5},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":6},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":7},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":8},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":9},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":10},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":11},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":12},{\"InputData\":\"a\",\"ExpectedOutput\":\"a\",\"IsSample\":false,\"Score\":0,\"TestCaseNumber\":13}],\"topics\":[1]}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 03:24:47', '2026-01-06 03:24:47'),
(195, 23, 'event', 'events', 87, 'create', '{}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767669902246_robert.jpg\",\"host_id\":23,\"reward_points\":1,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-07T03:24:00.000Z\",\"ends_at\":\"2026-01-08T03:24:00.000Z\"}', 'committed', '2026-01-06 03:27:39', 7, NULL, '2026-01-06 03:27:51', 4, 'Approved by admin', '2026-01-06 03:25:02', '2026-01-06 03:27:51'),
(196, 23, 'event', 'events', 88, 'create', '{}', '{\"event_name\":\"ef2\",\"thumbnail_url\":\"/asset/event/1767669906718_robert.jpg\",\"host_id\":23,\"reward_points\":1,\"reward_level\":0,\"status\":\"active\",\"starts_at\":\"2026-01-07T03:24:00.000Z\",\"ends_at\":\"2026-01-08T03:24:00.000Z\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 03:25:06', '2026-01-06 03:25:06'),
(197, 23, 'blog', 'blogs', 70, 'create', '{}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767669922435_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'committed', '2026-01-06 03:27:41', 7, NULL, '2026-01-06 03:27:50', 4, 'Approved by admin', '2026-01-06 03:25:22', '2026-01-06 03:27:50'),
(198, 23, 'blog', 'blogs', 71, 'create', '{}', '{\"title\":\"bf2\",\"content\":\"aaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767669927181_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 03:25:27', '2026-01-06 03:25:27'),
(199, 23, 'problem', 'problems', 183, 'update', NULL, '{\"problem_name\":\"pf1\",\"description\":\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"sample_solution\":\"print(\'a\')\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 03:28:05', '2026-01-06 03:28:05'),
(200, 23, 'event', 'events', 87, 'update', '{\"event_id\":87,\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767669902246_robert.jpg\",\"host_id\":23,\"reward_points\":1,\"reward_level\":0,\"created_at\":\"2026-01-06T03:25:02.000Z\",\"status\":\"\"}', '{\"event_name\":\"ef1\",\"thumbnail_url\":\"/asset/event/1767669902246_robert.jpg\",\"reward_points\":1,\"reward_level\":0,\"status\":\"\",\"starts_at\":\"2026-01-06T19:24:00.000Z\",\"ends_at\":\"2026-01-07T19:24:00.000Z\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 03:28:11', '2026-01-06 03:28:11'),
(201, 23, 'blog', 'blogs', 70, 'update', '{\"blog_id\":70,\"author_id\":23,\"thumbnail_url\":\"/asset/blog/1767669922435_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaa\",\"published_at\":\"2026-01-06T03:25:22.000Z\",\"updated_at\":null,\"status\":\"draft\",\"content_type\":\"Article\",\"created_at\":\"2026-01-06T03:25:22.000Z\"}', '{\"title\":\"bf1\",\"content\":\"aaaaaaaaaaaaaaaa\",\"status\":\"draft\",\"thumbnail_url\":\"/asset/blog/1767669922435_8925c960648ccdc23bdb55d6a9ac3845.jpg\",\"content_type\":\"Article\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 03:28:16', '2026-01-06 03:28:16'),
(202, 7, 'problem', 'problems', 185, 'update', '{\"problem_id\":185,\"problem_name\":\"E2E Test Problem\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"description\":\"E2E test\",\"sample_solution\":\"\"}', '{\"problem_name\":\"E2E Test Problem\",\"description\":\"E2E test\",\"difficulty\":\"Easy\",\"time_limit_seconds\":1,\"memory_limit_mb\":64,\"sample_solution\":\"\"}', 'committed', NULL, NULL, NULL, '2026-01-06 04:17:05', 4, 'Approved via admin pending questions', '2026-01-06 04:17:05', '2026-01-06 04:17:05'),
(203, 7, 'event', 'events', 89, 'create', '{}', '{\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"status\":\"active\",\"starts_at\":\"2026-01-06T05:19:53.523Z\",\"ends_at\":\"2026-01-06T06:19:53.525Z\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:19:53', '2026-01-06 04:19:53'),
(204, 7, 'event', 'events', 90, 'create', '{}', '{\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"status\":\"active\",\"starts_at\":\"2026-01-06T05:20:40.764Z\",\"ends_at\":\"2026-01-06T06:20:40.765Z\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:20:40', '2026-01-06 04:20:40'),
(205, 7, 'event', 'events', 90, 'update', '{\"event_id\":90,\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-06T04:20:40.000Z\",\"status\":\"\"}', '{\"event_name\":\"E2E Test Event v2\",\"thumbnail_url\":null,\"status\":\"\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:20:40', '2026-01-06 04:20:40'),
(206, 7, 'event', 'events', 91, 'create', '{}', '{\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"status\":\"active\",\"starts_at\":\"2026-01-06T05:20:59.169Z\",\"ends_at\":\"2026-01-06T06:20:59.170Z\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:20:59', '2026-01-06 04:20:59'),
(207, 7, 'event', 'events', 91, 'update', '{\"event_id\":91,\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-06T04:20:59.000Z\",\"status\":\"\"}', '{\"event_name\":\"E2E Test Event v2\",\"thumbnail_url\":null,\"status\":\"\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:20:59', '2026-01-06 04:20:59'),
(208, 7, 'blog', 'blogs', 72, 'create', '{}', '{\"title\":\"E2E Test Blog\",\"content\":\"Test\",\"status\":\"draft\",\"author_id\":7,\"thumbnail_url\":null,\"content_type\":\"html\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:20:59', '2026-01-06 04:20:59'),
(209, 7, 'event', 'events', 92, 'create', '{}', '{\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"status\":\"active\",\"starts_at\":\"2026-01-06T05:21:13.808Z\",\"ends_at\":\"2026-01-06T06:21:13.812Z\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:21:13', '2026-01-06 04:21:13'),
(210, 7, 'event', 'events', 92, 'update', '{\"event_id\":92,\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-06T04:21:13.000Z\",\"status\":\"\"}', '{\"event_name\":\"E2E Test Event v2\",\"thumbnail_url\":null,\"status\":\"\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:21:13', '2026-01-06 04:21:13'),
(211, 7, 'blog', 'blogs', 73, 'create', '{}', '{\"title\":\"E2E Test Blog\",\"content\":\"Test\",\"status\":\"draft\",\"author_id\":7,\"thumbnail_url\":null,\"content_type\":\"html\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:21:13', '2026-01-06 04:21:13'),
(212, 7, 'blog', 'blogs', 73, 'update', '{\"blog_id\":73,\"author_id\":7,\"thumbnail_url\":null,\"title\":\"E2E Test Blog\",\"content\":\"Test\",\"published_at\":\"2026-01-06T04:21:13.000Z\",\"updated_at\":null,\"status\":\"draft\",\"content_type\":\"html\",\"created_at\":\"2026-01-06T04:21:13.000Z\"}', '{\"title\":\"E2E Blog v2\",\"content\":\"updated\",\"status\":\"draft\",\"thumbnail_url\":null}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:21:14', '2026-01-06 04:21:14'),
(213, 7, 'event', 'events', 93, 'create', '{}', '{\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"status\":\"active\",\"starts_at\":\"2026-01-06T05:26:58.263Z\",\"ends_at\":\"2026-01-06T06:26:58.265Z\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:26:58', '2026-01-06 04:26:58'),
(214, 7, 'event', 'events', 93, 'update', '{\"event_id\":93,\"event_name\":\"E2E Test Event\",\"thumbnail_url\":null,\"host_id\":7,\"reward_points\":0,\"reward_level\":0,\"created_at\":\"2026-01-06T04:26:58.000Z\",\"status\":\"\"}', '{\"event_name\":\"E2E Test Event v2\",\"thumbnail_url\":null,\"status\":\"\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:26:58', '2026-01-06 04:26:58'),
(215, 7, 'blog', 'blogs', 74, 'create', '{}', '{\"title\":\"E2E Test Blog\",\"content\":\"Test\",\"status\":\"draft\",\"author_id\":7,\"thumbnail_url\":null,\"content_type\":\"html\"}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:26:58', '2026-01-06 04:26:58'),
(216, 7, 'blog', 'blogs', 74, 'update', '{\"blog_id\":74,\"author_id\":7,\"thumbnail_url\":null,\"title\":\"E2E Test Blog\",\"content\":\"Test\",\"published_at\":\"2026-01-06T04:26:58.000Z\",\"updated_at\":null,\"status\":\"draft\",\"content_type\":\"html\",\"created_at\":\"2026-01-06T04:26:58.000Z\"}', '{\"title\":\"E2E Blog v2\",\"content\":\"updated\",\"status\":\"draft\",\"thumbnail_url\":null}', 'pending_faculty_review', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-06 04:26:58', '2026-01-06 04:26:58'),
(217, 21, 'problem', 'problems', 1, 'create', NULL, '{\"problem_name\": \"Find First Duplicate\", \"difficulty\": \"Medium\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, find and return the first element that appears more than once. If no duplicate exists, return -1.\\n\\nExample:\\nInput: [2, 1, 3, 5, 3, 2]\\nOutput: 3\\n\\nInput: [1, 2, 3, 4]\\nOutput: -1\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(218, 21, 'problem', 'problems', 2, 'create', NULL, '{\"problem_name\": \"Two Sum\", \"difficulty\": \"Medium\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers and a target sum, return the indices of two numbers that add up to the target.\\n\\nExample:\\nInput: nums = [2, 7, 11, 15], target = 9\\nOutput: [0, 1]\\n\\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(219, 21, 'problem', 'problems', 3, 'create', NULL, '{\"problem_name\": \"Valid Parentheses\", \"difficulty\": \"Medium\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given a string containing only parentheses (), brackets [], and braces {}, determine if the input string is valid. A string is valid if all opening brackets have matching closing brackets in the correct order.\\n\\nExample:\\nInput: \\\"()[]{}\\\"\\nOutput: true\\n\\nInput: \\\"(]\\\"\\nOutput: false\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(220, 21, 'problem', 'problems', 18, 'create', NULL, '{\"problem_name\": \"Sum of Even Numbers\", \"difficulty\": \"Medium\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, calculate and return the sum of all even numbers in the array.\\n\\nExample:\\nInput: [1, 2, 3, 4, 5, 6]\\nOutput: 12\\n\\nExplanation: 2 + 4 + 6 = 12\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(221, 21, 'problem', 'problems', 21, 'create', NULL, '{\"problem_name\": \"Count Positive Numbers\", \"difficulty\": \"Medium\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, count and return how many numbers are positive (greater than 0).\\n\\nExample:\\nInput: [1, -2, 3, 0, 5, -7]\\nOutput: 3\\n\\nExplanation: 1, 3, and 5 are positive\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(222, 21, 'problem', 'problems', 33, 'create', NULL, '{\"problem_name\": \"Sum of Positive Numbers (+)\", \"difficulty\": \"Medium\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, calculate the sum of all positive numbers (greater than zero) in the array.\\n\\nExample:\\nInput: [1, -2, 3, -4, 5]\\nOutput: 9\\n\\nExplanation: 1 + 3 + 5 = 9\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(223, 21, 'problem', 'problems', 34, 'create', NULL, '{\"problem_name\": \"Count Numbers Greater Than 10\", \"difficulty\": \"Medium\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, count how many numbers are strictly greater than 10.\\n\\nExample:\\nInput: [5, 12, 8, 20, 11]\\nOutput: 3\\n\\nExplanation: 12, 20, and 11 are greater than 10\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(224, 21, 'problem', 'problems', 35, 'create', NULL, '{\"problem_name\": \"Sum of Two Numbers\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given two integers, return their sum.\\n\\nExample:\\nInput: 5 3\\nOutput: 8\\n\\nInput: -10 20\\nOutput: 10\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(225, 21, 'problem', 'problems', 36, 'create', NULL, '{\"problem_name\": \"Find Maximum in Array\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, find and return the largest number.\\n\\nExample:\\nInput: [3, 7, 2, 9, 1]\\nOutput: 9\\n\\nInput: [-5, -2, -10, -1]\\nOutput: -1\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(226, 21, 'problem', 'problems', 37, 'create', NULL, '{\"problem_name\": \"Count Vowels in String\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given a string, count the number of vowels (a, e, i, o, u) in it. Count both uppercase and lowercase vowels.\\n\\nExample:\\nInput: \\\"Hello World\\\"\\nOutput: 3\\n\\nExplanation: e, o, o are vowels\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(227, 21, 'problem', 'problems', 38, 'create', NULL, '{\"problem_name\": \"Reverse a String\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given a string, return the reversed string.\\n\\nExample:\\nInput: \\\"hello\\\"\\nOutput: \\\"olleh\\\"\\n\\nInput: \\\"Python\\\"\\nOutput: \\\"nohtyP\\\"\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(228, 21, 'problem', 'problems', 39, 'create', NULL, '{\"problem_name\": \"Is Number Even\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an integer, return \\\"true\\\" if it is even, \\\"false\\\" if it is odd.\\n\\nExample:\\nInput: 4\\nOutput: true\\n\\nInput: 7\\nOutput: false\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(229, 21, 'problem', 'problems', 40, 'create', NULL, '{\"problem_name\": \"Count Negative Numbers\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, count how many numbers are negative (less than 0).\\n\\nExample:\\nInput: [1, -2, 3, -4, -5, 6]\\nOutput: 3\\n\\nExplanation: -2, -4, -5 are negative\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(230, 21, 'problem', 'problems', 41, 'create', NULL, '{\"problem_name\": \"Multiply Array Elements\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, return the product of all elements.\\n\\nExample:\\nInput: [2, 3, 4]\\nOutput: 24\\n\\nExplanation: 2 * 3 * 4 = 24\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(231, 21, 'problem', 'problems', 42, 'create', NULL, '{\"problem_name\": \"Find Minimum in Array\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given an array of integers, find and return the smallest number.\\n\\nExample:\\nInput: [3, 7, 2, 9, 1]\\nOutput: 1\\n\\nInput: [-5, -2, -10, -1]\\nOutput: -10\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(232, 21, 'problem', 'problems', 65, 'create', NULL, '{\"problem_name\": \"Sum of Odd Numbers\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given a list of integers in one line, print the sum of all odd numbers.\", \"sample_solution\": null}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(233, 21, 'problem', 'problems', 66, 'create', NULL, '{\"problem_name\": \"Longest Increasing Subsequence Length (Simple Version)\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"Given a list of integers in one line, determine the length of the longest strictly increasing subsequence (LIS).\", \"sample_solution\": \"nums = list(map(int, input().split()))\\nn = len(nums)\\n\\ndp = [1] * n\\n\\nfor i in range(n):\\n    for j in range(i):\\n        if nums[j] < nums[i]:\\n            dp[i] = max(dp[i], dp[j] + 1)\\n\\nprint(max(dp))\\n\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(234, 21, 'problem', 'problems', 76, 'create', NULL, '{\"problem_name\": \"hhhhh\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhaa\", \"sample_solution\": \"print(\'h\')\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(235, 21, 'problem', 'problems', 80, 'create', NULL, '{\"problem_name\": \"ffffffffffffff\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"ffffffffffffffffffffffffffffffffffffffffffffff\", \"sample_solution\": \"print(\'f\')\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(236, 21, 'problem', 'problems', 87, 'create', NULL, '{\"problem_name\": \"zzzzzzzzzzzzzzz\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"zzzzzzzzzzzzzzzzzzzzzenless\", \"sample_solution\": \"print(\'a\')\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(237, 21, 'problem', 'problems', 98, 'create', NULL, '{\"problem_name\": \"Test question as admin\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\", \"sample_solution\": \"print(\'a\')\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(238, 21, 'problem', 'problems', 114, 'create', NULL, '{\"problem_name\": \"users question\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk\", \"sample_solution\": \"print(\'k\')\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(239, 21, 'problem', 'problems', 126, 'create', NULL, '{\"problem_name\": \"user question no1\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\", \"sample_solution\": \"print(\'a\')\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18'),
(240, 21, 'problem', 'problems', 127, 'create', NULL, '{\"problem_name\": \"question by admin no.2\", \"difficulty\": \"Easy\", \"time_limit_seconds\": 1, \"memory_limit_mb\": 64, \"description\": \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\", \"sample_solution\": \"print(\'a\')\"}', 'committed', NULL, NULL, NULL, '2026-01-06 05:52:18', 4, 'Backfilled from approved content', '2026-01-06 05:52:18', '2026-01-06 05:52:18');

-- --------------------------------------------------------

--
-- Table structure for table `fk_orphans_report`
--

CREATE TABLE `fk_orphans_report` (
  `fk_name` varchar(255) DEFAULT NULL,
  `child_table` varchar(255) DEFAULT NULL,
  `parent_table` varchar(255) DEFAULT NULL,
  `orphan_count` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lobby_rounds`
--

CREATE TABLE `lobby_rounds` (
  `round_id` int(11) NOT NULL,
  `lobby_id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL DEFAULT 1,
  `problem_id` int(11) DEFAULT NULL,
  `problem_name` varchar(255) DEFAULT NULL,
  `started_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lobby_rounds`
--

INSERT INTO `lobby_rounds` (`round_id`, `lobby_id`, `round_number`, `problem_id`, `problem_name`, `started_at`) VALUES
(1, 191, 1, 41, 'Multiply Array Elements', '2026-03-14 06:43:14'),
(2, 191, 2, 33, 'Sum of Positive Numbers (+)', '2026-03-14 06:44:25'),
(3, 191, 3, 1, 'Find First Duplicate', '2026-03-14 06:45:23'),
(4, 196, 1, 37, 'Count Vowels in String', '2026-03-21 22:16:18'),
(5, 197, 1, 41, 'Multiply Array Elements', '2026-03-31 10:56:15'),
(6, 198, 1, 100, 'Hello World', '2026-04-02 21:54:57');

-- --------------------------------------------------------

--
-- Table structure for table `match_records`
--

CREATE TABLE `match_records` (
  `record_id` int(11) NOT NULL,
  `match_id` int(11) DEFAULT NULL,
  `player_id` int(11) NOT NULL,
  `code_submitted` text DEFAULT NULL,
  `result` enum('passed','failed') DEFAULT 'failed',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `match_records`
--

INSERT INTO `match_records` (`record_id`, `match_id`, `player_id`, `code_submitted`, `result`, `submitted_at`) VALUES
(1, 41, 1, 's = input().strip()   # read the string, e.g. ()[]{}\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":          # opening bracket\n        stack.append(ch)\n    elif ch in \")]}\":        # closing bracket\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\n# if anything left in stack, it\'s invalid\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")\n', '', '2025-12-13 06:51:40'),
(2, 42, 1, 's = input().strip()   # read the string, e.g. ()[]{}\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":          # opening bracket\n        stack.append(ch)\n    elif ch in \")]}\":        # closing bracket\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\n# if anything left in stack, it\'s invalid\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")\n', '', '2025-12-13 06:57:45'),
(3, 42, 1, 's = input().strip()   # read the string, e.g. ()[]{}\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":          # opening bracket\n        stack.append(ch)\n    elif ch in \")]}\":        # closing bracket\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\n# if anything left in stack, it\'s invalid\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")\n', '', '2025-12-13 06:57:49'),
(4, 42, 1, 's = input().strip()   # read the string, e.g. ()[]{}\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":          # opening bracket\n        stack.append(ch)\n    elif ch in \")]}\":        # closing bracket\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\n# if anything left in stack, it\'s invalid\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")\n', '', '2025-12-13 06:57:49'),
(5, 42, 1, 's = input().strip()   # read the string, e.g. ()[]{}\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":          # opening bracket\n        stack.append(ch)\n    elif ch in \")]}\":        # closing bracket\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\n# if anything left in stack, it\'s invalid\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")\n', '', '2025-12-13 06:57:50'),
(6, 42, 1, 's = input().strip()   # read the string, e.g. ()[]{}\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":          # opening bracket\n        stack.append(ch)\n    elif ch in \")]}\":        # closing bracket\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\n# if anything left in stack, it\'s invalid\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")\n', '', '2025-12-13 06:57:59'),
(7, 42, 1, 's = input().strip()   # read the string, e.g. ()[]{}\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":          # opening bracket\n        stack.append(ch)\n    elif ch in \")]}\":        # closing bracket\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\n# if anything left in stack, it\'s invalid\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")\n', '', '2025-12-13 06:58:07'),
(8, 43, 1, '# Read input\ndata = input().strip()\n\nif data == \"[]\" or data == \"\":\n    print([])\nelse:\n    # Remove outer brackets\n    s = data[1:-1]\n    # Replace inner brackets with commas\n    s = s.replace(\'[\',\'\').replace(\']\',\'\')\n    # Split into numbers\n    nums = [int(x) for x in s.split(\',\') if x.strip()]\n    # Sort and print\n    nums.sort()\n    print(nums)\n', '', '2025-12-13 07:02:18'),
(13, 254, 8, 'import ast\narr = ast.literal_eval(input().strip())\nseen = set()\nresult = -1\nfor num in arr:\n    if num in seen:\n        result = num\n        break\n    seen.add(num)\nprint(result)', '', '2025-12-30 08:08:52'),
(14, 254, 1, 'import ast\narr = ast.literal_eval(input().strip())\nseen = set()\nresult = -1\nfor num in arr:\n    if num in seen:\n        result = num\n        break\n    seen.add(num)\nprint(result)', '', '2025-12-30 08:09:00'),
(15, 255, 1, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2025-12-30 08:10:50'),
(16, 255, 8, 'n = int(input().strip())\nprint(\"true\" if n % 2 == 0 else \"false\")', '', '2025-12-30 08:11:02'),
(17, NULL, 1, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2025-12-30 08:38:32'),
(18, NULL, 3, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2025-12-30 08:38:46'),
(19, NULL, 1, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2025-12-30 08:39:58'),
(20, NULL, 3, 'import ast\nlists = ast.literal_eval(input().strip())\n\n# Flatten all lists and sort\nresult = []\nfor lst in lists:\n    result.extend(lst)\nresult.sort()\n\nprint(result)', '', '2025-12-30 08:47:33'),
(21, NULL, 1, 'import ast\nlists = ast.literal_eval(input().strip())\n\n# Flatten all lists and sort\nresult = []\nfor lst in lists:\n    result.extend(lst)\nresult.sort()\n\nprint(result)', '', '2025-12-30 08:47:47'),
(22, NULL, 3, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2025-12-30 08:52:53'),
(23, NULL, 1, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2025-12-30 08:53:06'),
(24, NULL, 1, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2025-12-30 08:54:27'),
(25, NULL, 1, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2025-12-30 10:28:05'),
(26, NULL, 3, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2025-12-30 10:28:17'),
(27, NULL, 1, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2025-12-30 10:43:18'),
(28, NULL, 3, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2025-12-30 10:43:32'),
(29, NULL, 3, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2025-12-30 11:15:27'),
(30, NULL, 1, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2025-12-30 11:15:29'),
(31, NULL, 3, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num > 10)\nprint(count)', '', '2025-12-30 11:19:26'),
(32, NULL, 1, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num > 10)\nprint(count)', '', '2025-12-30 11:19:35'),
(33, NULL, 1, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2025-12-30 15:42:04'),
(34, NULL, 3, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2025-12-30 15:42:38'),
(35, NULL, 1, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2025-12-30 15:56:07'),
(36, NULL, 3, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2025-12-30 15:56:28'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2026-03-09 07:19:01'),
(0, 244, 3, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(3)', '', '2026-03-09 07:19:12'),
(0, 244, 3, 's = input().strip()\n\nif not s:\n    print(0)\nelse:\n    seen = {}\n    max_len = 0\n    start = 0\n\n    for i, char in enumerate(s):\n        if char in seen and seen[char] >= start:\n            start = seen[char] + 1\n        seen[char] = i\n        max_len = max(max_len, i - start + 1)\n    \n    print(max_len)', '', '2026-03-09 07:21:51'),
(0, NULL, 8, 's = input().strip()\n\nif not s:\n    print(0)\nelse:\n    seen = {}\n    max_len = 0\n    start = 0\n\n    for i, char in enumerate(s):\n        if char in seen and seen[char] >= start:\n            start = seen[char] + 1\n        seen[char] = i\n        max_len = max(max_len, i - start + 1)\n    \n    print(\"[]\")', '', '2026-03-09 07:22:11'),
(0, NULL, 3, 'print(0)', '', '2026-03-13 12:05:10'),
(0, NULL, 20, 'print(3)', '', '2026-03-13 12:05:30'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2026-03-13 12:06:13'),
(0, NULL, 3, 'print(3)', '', '2026-03-13 12:20:51'),
(0, NULL, 20, 'print(0)', '', '2026-03-13 12:21:01'),
(0, NULL, 8, 'print(5)', '', '2026-03-13 12:21:11'),
(0, NULL, 3, 'print(1)', '', '2026-03-13 12:48:03'),
(0, NULL, 20, 'print(5)', '', '2026-03-13 12:48:18'),
(0, NULL, 8, 'print(10)', '', '2026-03-13 12:48:53'),
(0, NULL, 3, 'print(8)', '', '2026-03-13 12:53:47'),
(0, NULL, 20, 'print(30)', '', '2026-03-13 12:54:08'),
(0, NULL, 8, 'print(8)', '', '2026-03-13 12:54:20'),
(0, NULL, 8, 'print(8)', '', '2026-03-13 12:54:25'),
(0, NULL, 3, 'print(3)', '', '2026-03-13 12:56:12'),
(0, NULL, 20, 'print(0)', '', '2026-03-13 12:56:30'),
(0, NULL, 8, 'print(4)', '', '2026-03-13 12:56:39'),
(0, NULL, 3, 'print(3)', '', '2026-03-13 13:02:27'),
(0, NULL, 20, 'print(0)', '', '2026-03-13 13:02:42'),
(0, NULL, 8, 'print(4)', '', '2026-03-13 13:03:03'),
(0, NULL, 3, 'print(\"olleh\")', '', '2026-03-13 13:03:34'),
(0, NULL, 8, 'print(\"a\")', '', '2026-03-13 13:03:59'),
(0, NULL, 20, 's = input().strip()\nprint(s[::-1])', '', '2026-03-13 13:04:23'),
(0, NULL, 3, 'print(8)', '', '2026-03-13 13:19:29'),
(0, NULL, 8, 'print(30)', '', '2026-03-13 13:19:40'),
(0, NULL, 20, 'print(0)', '', '2026-03-13 13:19:49'),
(0, NULL, 3, 'print(9)', '', '2026-03-13 13:20:25'),
(0, NULL, 8, 'print(1)', '', '2026-03-13 13:20:35'),
(0, NULL, 20, 'print(5)', '', '2026-03-13 13:20:45'),
(0, NULL, 3, 'print(3)', '', '2026-03-13 13:30:40'),
(0, NULL, 8, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2026-03-13 13:31:09'),
(0, NULL, 20, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(5)', '', '2026-03-13 13:31:18'),
(0, NULL, 3, 'print(1)', '', '2026-03-13 13:35:54'),
(0, NULL, 20, 'print(5)', '', '2026-03-13 13:36:04'),
(0, NULL, 8, 'print(10)', '', '2026-03-13 13:36:14'),
(0, NULL, 3, 'print(3)', '', '2026-03-13 13:39:58'),
(0, NULL, 20, 'print(5)', '', '2026-03-13 13:40:06'),
(0, NULL, 8, 'print(0)', '', '2026-03-13 13:40:17'),
(0, NULL, 3, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2026-03-13 13:45:12'),
(0, NULL, 8, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2026-03-13 13:45:44'),
(0, NULL, 20, 's = input().strip()\nvowels = \"aeiouAEIOU\"\ncount = sum(1 for char in s if char in vowels)\nprint(count)', '', '2026-03-13 13:45:55'),
(0, NULL, 3, 'print(8)', '', '2026-03-13 13:46:38'),
(0, NULL, 3, 'print(\"olleh\")', '', '2026-03-13 13:50:55'),
(0, NULL, 8, 's = input().strip()\nprint(s[::-1])', '', '2026-03-13 13:51:16'),
(0, NULL, 20, 's = input().strip()\nprint(a)', '', '2026-03-13 13:51:29'),
(0, NULL, 3, 'print(8)', '', '2026-03-13 13:57:04'),
(0, NULL, 8, 'a, b = map(int, input().strip().split())\nprint(a + b)', '', '2026-03-13 13:57:29'),
(0, NULL, 20, 'c = 3\na, b = map(int, input().strip().split())\nprint(a + c)', '', '2026-03-13 13:57:51'),
(0, NULL, 3, 'print(\"true\")', '', '2026-03-13 16:39:59'),
(0, NULL, 8, 'print(\"false\")', '', '2026-03-13 16:40:42'),
(0, NULL, 20, 'print(\"true\")', '', '2026-03-13 16:41:14'),
(0, NULL, 3, 'print(9)', '', '2026-03-13 16:50:30'),
(0, NULL, 20, 'print(1)', '', '2026-03-13 16:50:48'),
(0, NULL, 8, 'print(5)', '', '2026-03-13 16:51:01'),
(0, NULL, 3, 'print(\"olleh\")', '', '2026-03-13 16:51:38'),
(0, NULL, 8, 'print(\"dlrow\")', '', '2026-03-13 16:51:52'),
(0, NULL, 20, 'print(\"a\")', '', '2026-03-13 16:52:05'),
(0, NULL, 3, 'print(24)', '', '2026-03-13 16:52:28'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\nresult = 1\nfor num in arr:\n    result *= num\nprint(result)', '', '2026-03-13 16:52:48'),
(0, NULL, 20, 'import ast\narr = ast.literal_eval(input().strip())\nresult = 1\nfor num in arr:\n    result *= num\nprint(6)', '', '2026-03-13 16:53:00'),
(0, NULL, 3, 'print(\"olleh\")', '', '2026-03-13 16:54:09'),
(0, NULL, 20, 's = input().strip()\nprint(s[::-1])', '', '2026-03-13 16:54:26'),
(0, NULL, 8, 's = input().strip()\nprint(s[::-2])', '', '2026-03-13 16:54:41'),
(0, NULL, 20, 'print(3)', '', '2026-03-13 16:57:02'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2026-03-13 16:57:28'),
(0, NULL, 3, 'print(24)', '', '2026-03-13 20:46:53'),
(0, NULL, 20, 'print(6)', '', '2026-03-13 20:47:05'),
(0, NULL, 8, 'print(25)', '', '2026-03-13 20:47:19'),
(0, NULL, 8, 'n = int(input().strip())\nprint(\"true\" if n % 2 == 0 else \"false\")', '', '2026-03-13 20:48:27'),
(0, NULL, 20, 'print(\"true\")', '', '2026-03-13 20:48:45'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\ntotal = sum(num for num in arr if num % 2 == 0)\nprint(total)', '', '2026-03-13 20:53:52'),
(0, NULL, 3, 'import ast\narr = ast.literal_eval(input().strip())\ntotal = sum(num for num in arr if num % 2 == 0)\nprint(0)', '', '2026-03-13 20:53:59'),
(0, NULL, 20, 'import ast\nlists = ast.literal_eval(input().strip())\n\n# Flatten all lists and sort\nresult = [] \nfor lst in lists:\n    result.extend(lst)\nresult.sort()\n\nprint(result)', '', '2026-03-13 21:03:32'),
(0, NULL, 8, 'import ast\nlists = ast.literal_eval(input().strip())\n\n# Flatten all lists and sort\nresult = [] \nfor lst in lists:\n    result.extend(lst)\nresult.sort()\n\nprint(result)', '', '2026-03-13 21:03:41'),
(0, NULL, 20, 'import ast\nlists = ast.literal_eval(input().strip())\n\n# Flatten all lists and sort\nresult = [] \nfor lst in lists:\n    result.extend(lst)\nresult.sort()\n\nprint(result)', '', '2026-03-13 21:04:31'),
(0, NULL, 8, 'import ast\nlists = ast.literal_eval(input().strip())\n\n# Flatten all lists and sort\nresult = [] \nfor lst in lists:\n    result.extend(lst)\nresult.sort()\n\nprint(\"[]\")', '', '2026-03-13 21:04:44'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\nseen = set()\nresult = -1\nfor num in arr:\n    if num in seen:\n        result = num\n        break\n    seen.add(num)\nprint(result)', '', '2026-03-13 21:13:08'),
(0, NULL, 20, 'import ast\narr = ast.literal_eval(input().strip())\nseen = set()\nresult = -2\nfor num in arr:\n    if num in seen:\n        result = num\n        break\n    seen.add(num)\nprint(result)', '', '2026-03-13 21:13:16'),
(0, NULL, 20, 'dawd', '', '2026-03-13 21:14:25'),
(0, NULL, 8, 'da', '', '2026-03-13 21:14:28'),
(0, NULL, 3, 'print(3)', '', '2026-03-13 21:35:58'),
(0, NULL, 20, 'print(5)', '', '2026-03-13 21:36:15'),
(0, NULL, 8, 'dwad', '', '2026-03-13 21:37:55'),
(0, NULL, 20, 'aw', '', '2026-03-13 21:38:47'),
(0, NULL, 8, 'dwa', '', '2026-03-13 21:38:52'),
(0, NULL, 20, 'wdaw', '', '2026-03-13 21:39:29'),
(0, NULL, 8, 'dwad', '', '2026-03-13 21:39:32'),
(0, NULL, 20, 'print(0)', '', '2026-03-13 21:46:13'),
(0, NULL, 8, '# Time expired - no submission', '', '2026-03-13 21:46:34'),
(0, NULL, 8, 'wda', '', '2026-03-13 21:47:42'),
(0, NULL, 20, 'print(1)', '', '2026-03-13 21:48:20'),
(0, NULL, 20, 'print(3)', '', '2026-03-13 21:54:28'),
(0, NULL, 8, 'print(0)', '', '2026-03-13 21:54:37'),
(0, NULL, 20, 'print(true)', '', '2026-03-13 21:55:57'),
(0, NULL, 8, 'print(\"true\")', '', '2026-03-13 21:56:09'),
(0, NULL, 8, '# Time expired - no submission', '', '2026-03-13 22:01:36'),
(0, NULL, 20, '# Time expired - no submission', '', '2026-03-13 22:01:36'),
(0, NULL, 20, 'print(\"true\")', '', '2026-03-13 22:08:03'),
(0, NULL, 8, 'print(\"false\")', '', '2026-03-13 22:08:43'),
(0, NULL, 8, 'print(25)', '', '2026-03-13 22:09:52'),
(0, NULL, 20, 'print(0)', '', '2026-03-13 22:10:00'),
(0, NULL, 20, '# Time expired - no submission', '', '2026-03-13 22:16:02'),
(0, NULL, 8, '# Time expired - no submission', '', '2026-03-13 22:16:03'),
(0, NULL, 20, 'print(\"true\")', '', '2026-03-13 22:22:54'),
(0, NULL, 8, 'print(\"false\")', '', '2026-03-13 22:23:09'),
(0, NULL, 20, 'print(3)', '', '2026-03-13 22:24:04'),
(0, NULL, 8, 'print(1)', '', '2026-03-13 22:24:16'),
(0, NULL, 20, 's = input().strip()\n\nstack = []\npairs = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\n\nvalid = True\nfor ch in s:\n    if ch in \"([{\":\n        stack.append(ch)\n    elif ch in \")]}\":\n        if not stack or stack[-1] != pairs[ch]:\n            valid = False\n            break\n        stack.pop()\n\nif stack:\n    valid = False\n\nprint(\"true\" if valid else \"false\")', '', '2026-03-13 22:25:21'),
(0, NULL, 8, 'print(\"true\")', '', '2026-03-13 22:25:36'),
(0, NULL, 20, 'import ast\narr = ast.literal_eval(input().strip())\nresult = 1\nfor num in arr:\n    result *= num\nprint(result)', '', '2026-03-13 22:43:47'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\nresult = 2\nfor num in arr:\n    result *= num\nprint(result)', '', '2026-03-13 22:43:57'),
(0, NULL, 20, 'import ast\narr = ast.literal_eval(input().strip())\ntotal = sum(num for num in arr if num > 0)\nprint(total)', '', '2026-03-13 22:44:48'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\ntotal = sum(num for num in arr if num > 1)\nprint(total)', '', '2026-03-13 22:45:02'),
(0, NULL, 8, 'import ast\narr = ast.literal_eval(input().strip())\nseen = set()\nresult = -1\nfor num in arr:\n    if num in seen:\n        result = num\n        break\n    seen.add(num)\nprint(result)', '', '2026-03-13 22:45:43'),
(0, NULL, 20, 'import ast\narr = ast.literal_eval(input().strip())\nseen = set()\nresult = -2\nfor num in arr:\n    if num in seen:\n        result = num\n        break\n    seen.add(num)\nprint(result)', '', '2026-03-13 22:45:52'),
(0, 257, 3, 'print(12)', '', '2026-03-13 22:49:18'),
(0, 257, 8, 'print(\"[0, 1]\")', '', '2026-03-13 22:49:42'),
(0, 258, 3, 'print(\"true\")', '', '2026-03-13 22:50:31'),
(0, 258, 8, 'print(0)', '', '2026-03-13 22:50:48'),
(0, 259, 3, '', '', '2026-03-21 14:11:20'),
(0, 259, 8, '', '', '2026-03-21 14:16:00'),
(0, 260, 3, 'print(\"[]\")', '', '2026-03-31 02:40:15'),
(0, 260, 8, 'print(\"3\")', '', '2026-03-31 02:42:10'),
(0, 261, 8, '', '', '2026-03-31 02:51:25'),
(0, 261, 3, '', '', '2026-03-31 02:53:12'),
(0, NULL, 20, 'print(\"24\")', '', '2026-03-31 02:57:22'),
(0, NULL, 8, 'u', '', '2026-03-31 02:58:43'),
(0, NULL, 8, '\nint a = c + b\nprint(a)', '', '2026-04-01 20:21:49'),
(0, 262, 3, 'print(5)', '', '2026-04-02 02:09:47'),
(0, 262, 8, 'print(\"hello world\")', '', '2026-04-02 02:10:19'),
(0, 263, 8, 'print(\"even\")', '', '2026-04-02 02:26:29'),
(0, 263, 3, 'a = int(input())\nb = int(input())\nprint(a + b)', '', '2026-04-02 02:27:16'),
(0, 264, 3, 'print(1)', '', '2026-04-02 02:42:09'),
(0, 264, 8, '', '', '2026-04-02 02:42:29'),
(0, 265, 8, 'print(8)', '', '2026-04-02 02:43:15'),
(0, 266, 8, '', '', '2026-04-02 02:50:19'),
(0, 267, 8, '', '', '2026-04-02 02:57:04'),
(0, 267, 8, 'print(\"5\")', '', '2026-04-02 03:02:28'),
(0, 268, 8, 'print(\"Hello, Alice!\")', '', '2026-04-02 03:18:13'),
(0, 269, 8, 'print(\"12\")', '', '2026-04-02 03:23:09'),
(0, 270, 8, 'print(\"12\")', '', '2026-04-02 03:25:32'),
(0, 271, 8, 'print(\"Hello, Alice!\")', '', '2026-04-02 03:31:37'),
(0, 271, 3, 'print(3)', '', '2026-04-02 03:31:51'),
(0, 272, 8, 'print(\"Even\")', '', '2026-04-02 03:38:23'),
(0, 272, 3, 'print(\"true\")', '', '2026-04-02 03:38:45'),
(0, 273, 3, 'print(12)', '', '2026-04-02 04:03:27'),
(0, 273, 8, 'n = int(input())\nprint(\"Even\" if n % 2 == 0 else \"Odd\")', '', '2026-04-02 04:05:12'),
(0, 274, 8, 'fes', '', '2026-04-02 04:25:41'),
(0, 274, 3, 'print(3)', '', '2026-04-02 04:25:52'),
(0, 275, 8, 'print(\"2\")', '', '2026-04-02 08:48:29'),
(0, 275, 3, 'print(\"12\")', '', '2026-04-02 08:48:50'),
(0, 276, 3, 'print(\"olleh\")', '', '2026-04-02 08:49:40'),
(0, 276, 8, 'print(\"2\")', '', '2026-04-02 08:49:56'),
(0, 277, 3, 'print(\"3\")', '', '2026-04-02 08:52:38'),
(0, 277, 8, 'print(\"2\")', '', '2026-04-02 08:52:58'),
(0, 278, 3, 'n = int(input())\nnum = [int(input()) for _ in range(n)]\ntarget = int(input())\nseen = {}\nfor i, x in enumerate(nums):\ncomplement = target - x\nif complement in seen:\nprint(seen[complement], i)\nbreak\nseen[x] = i', '', '2026-04-02 12:53:54'),
(0, 278, 8, 'print(2)', '', '2026-04-02 12:54:33'),
(0, 279, 8, 'print(\"olleh\")', '', '2026-04-02 13:18:30'),
(0, 280, 8, 'print(2)', '', '2026-04-02 13:23:38'),
(0, 280, 3, '', '', '2026-04-02 13:23:46'),
(0, 281, 3, 'print(1)', '', '2026-04-02 13:28:13'),
(0, 281, 8, 'print(2)', '', '2026-04-02 13:28:31'),
(0, 282, 3, 'print(\"[0, 1]\")', '', '2026-04-02 13:35:16'),
(0, 282, 8, 'print(2)', '', '2026-04-02 13:35:34'),
(0, 283, 3, 'print(0)', '', '2026-04-02 13:36:27'),
(0, 283, 8, 'print(1)', '', '2026-04-02 13:36:40'),
(0, 284, 8, 'print(2)', '', '2026-04-02 13:37:14'),
(0, 284, 3, 'print(9)', '', '2026-04-02 13:37:31'),
(0, 285, 3, 'print(3)', '', '2026-04-02 13:38:55'),
(0, 285, 8, 'print(3)', '', '2026-04-02 13:39:06'),
(0, 286, 8, 'print(\"true\")', '', '2026-04-02 13:49:12'),
(0, 286, 3, 'print(3)', '', '2026-04-02 13:49:23'),
(0, 287, 8, 'a = int(input())\nb = int(input())\nprint(a + b)', '', '2026-04-02 13:51:31'),
(0, 287, 3, 'print(5)', '', '2026-04-02 13:52:20'),
(0, 288, 3, 'print(3)', '', '2026-04-02 13:53:27'),
(0, 288, 8, 'print(\"12\")', '', '2026-04-02 13:53:46'),
(0, NULL, 8, 'print(\"Hello World\")', '', '2026-04-02 13:55:23'),
(0, NULL, 3, 'print(\"Hello World\")', '', '2026-04-02 13:55:53');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` varchar(64) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `link` varchar(1024) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `link`, `is_read`, `created_at`, `read_at`, `is_deleted`, `deleted_at`) VALUES
(1, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":141,\"question_id\":25}', NULL, 1, '2025-12-19 02:15:55', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(2, 4, 'question_denied', 'Question Denied', 'Automated test deny', '{\"approval_id\":142,\"question_id\":25,\"reason\":\"Automated test deny\"}', NULL, 1, '2025-12-19 02:18:16', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(3, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":143,\"question_id\":25}', NULL, 1, '2025-12-19 02:39:03', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(4, 4, 'question_denied', 'Question Denied', 'Automated test deny', '{\"approval_id\":144,\"question_id\":25,\"reason\":\"Automated test deny\"}', NULL, 1, '2025-12-19 02:40:22', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(5, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 02:52:04', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(6, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 02:56:46', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(7, 7, 'question_denied', 'Question Denied', 'brooo', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"brooo\"}', NULL, 1, '2025-12-19 02:57:08', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(8, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 03:00:59', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(9, 7, 'question_denied', 'Question Denied', 'boohooo', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"boohooo\"}', NULL, 1, '2025-12-19 03:01:45', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(10, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 03:05:52', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(11, 7, 'question_denied', 'Question Denied', 'no js', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"no js\"}', NULL, 1, '2025-12-19 03:06:22', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(12, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 03:09:17', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(13, 7, 'question_denied', 'Question Denied', 'shit', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"shit\"}', NULL, 1, '2025-12-19 03:10:01', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(14, 1, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":146,\"question_id\":25}', NULL, 0, '2025-12-19 03:17:10', NULL, 0, NULL),
(15, 1, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":147,\"question_id\":25}', NULL, 0, '2025-12-19 03:17:17', NULL, 0, NULL),
(16, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 03:58:48', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(17, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 04:27:00', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(18, 7, 'question_denied', 'Question Denied', 'no', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"no\"}', NULL, 1, '2025-12-19 04:34:06', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(19, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 04:34:54', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(20, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 04:35:27', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(21, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 04:38:33', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(22, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 04:39:28', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(23, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 04:57:45', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(24, 7, 'question_denied', 'Question Denied', 'ok', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"ok\"}', NULL, 1, '2025-12-19 04:58:22', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(25, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":149,\"question_id\":98}', NULL, 1, '2025-12-19 16:09:03', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(26, 20, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":156,\"content_type\":\"blog\"}', NULL, 1, '2025-12-20 00:05:24', '2025-12-20 04:24:43', 1, '2025-12-20 12:24:45'),
(27, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":157,\"question_id\":103}', NULL, 1, '2025-12-20 00:25:57', '2025-12-20 04:24:43', 1, '2025-12-20 12:24:45'),
(28, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":160,\"question_id\":104}', NULL, 1, '2025-12-20 01:17:01', '2025-12-20 04:24:43', 1, '2025-12-20 12:24:45'),
(29, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":163,\"question_id\":105}', NULL, 1, '2025-12-20 02:27:14', '2025-12-20 04:24:43', 1, '2025-12-20 12:24:45'),
(30, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":171,\"question_id\":107}', NULL, 0, '2025-12-20 04:25:00', NULL, 0, NULL),
(31, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":181,\"question_id\":113}', NULL, 0, '2025-12-20 05:22:03', NULL, 1, '2026-03-13 19:48:03'),
(32, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":182,\"question_id\":114}', NULL, 1, '2025-12-20 13:21:48', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(33, 7, 'question_denied', 'Question Denied', 'shit', '{\"approval_id\":183,\"question_id\":115,\"reason\":\"shit\"}', NULL, 1, '2025-12-20 13:44:22', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(34, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":184,\"event_id\":26}', NULL, 1, '2025-12-20 14:02:07', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(35, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":184,\"event_id\":26}', NULL, 1, '2025-12-20 23:42:55', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(36, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":184,\"event_id\":26}', NULL, 1, '2025-12-21 00:25:07', '2025-12-30 07:59:06', 1, '2025-12-21 19:40:32'),
(37, 7, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":186,\"content_type\":\"blog\"}', NULL, 1, '2025-12-22 01:04:00', '2025-12-30 07:59:06', 1, '2025-12-30 15:59:06'),
(38, 22, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":189,\"content_type\":\"problem\"}', NULL, 0, '2025-12-22 01:04:05', NULL, 0, NULL),
(39, 4, 'item_denied', 'aaaa', 'Your submission \"aaaa\" was denied. s', '{\"approval_id\":126,\"content_type\":\"problem\"}', NULL, 1, '2025-12-23 02:19:11', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(40, 9, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":121,\"question_id\":76}', NULL, 0, '2025-12-23 03:54:23', NULL, 0, NULL),
(41, 9, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":121,\"question_id\":76}', NULL, 0, '2025-12-23 04:27:17', NULL, 0, NULL),
(42, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 05:01:31', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(43, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 05:03:00', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(44, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 05:03:47', '2025-12-30 05:23:30', 1, '2025-12-28 13:04:17'),
(45, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 05:22:23', '2025-12-30 05:23:30', 0, NULL),
(46, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":125,\"question_id\":80}', NULL, 1, '2025-12-28 05:23:59', '2025-12-30 05:23:30', 0, NULL),
(47, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 05:24:01', '2025-12-30 05:23:30', 0, NULL),
(48, 9, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":121,\"question_id\":76}', NULL, 0, '2025-12-28 05:51:07', NULL, 0, NULL),
(49, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 05:51:24', '2025-12-30 05:23:30', 0, NULL),
(50, 22, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":189,\"question_id\":126}', NULL, 0, '2025-12-30 07:18:27', NULL, 0, NULL),
(51, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":199,\"question_id\":132}', NULL, 1, '2026-01-03 07:52:57', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(52, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":203,\"question_id\":134}', NULL, 1, '2026-01-03 08:31:58', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(53, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":208,\"question_id\":135}', NULL, 1, '2026-01-03 09:23:50', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(54, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":209,\"question_id\":136}', NULL, 1, '2026-01-03 09:50:06', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(55, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":212,\"question_id\":139}', NULL, 1, '2026-01-03 10:55:27', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(56, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":214,\"event_id\":46}', NULL, 1, '2026-01-03 22:48:30', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(57, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":213,\"event_id\":45}', NULL, 1, '2026-01-03 22:48:51', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(58, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":215,\"event_id\":47}', NULL, 1, '2026-01-03 22:50:32', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(59, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":216,\"blog_id\":34}', NULL, 1, '2026-01-03 22:54:54', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(60, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":217,\"blog_id\":35}', NULL, 1, '2026-01-03 22:55:13', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(61, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":219,\"event_id\":49}', NULL, 1, '2026-01-03 23:15:01', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(62, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":221,\"blog_id\":36}', NULL, 1, '2026-01-03 23:15:28', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(63, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":220,\"event_id\":50}', NULL, 1, '2026-01-03 23:15:37', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(64, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":222,\"blog_id\":37}', NULL, 1, '2026-01-03 23:15:41', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(65, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":225,\"event_id\":51}', NULL, 1, '2026-01-04 00:03:36', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(66, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":227,\"blog_id\":38}', NULL, 1, '2026-01-04 00:03:39', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(67, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":226,\"event_id\":52}', NULL, 1, '2026-01-04 00:04:05', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(68, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":228,\"blog_id\":39}', NULL, 1, '2026-01-04 00:04:25', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(69, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":229,\"event_id\":53}', NULL, 1, '2026-01-04 00:29:38', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(70, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":224,\"question_id\":140}', NULL, 1, '2026-01-04 00:29:50', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(71, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":231,\"question_id\":141}', NULL, 1, '2026-01-04 01:16:06', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(72, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":233,\"event_id\":54}', NULL, 1, '2026-01-04 01:17:03', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(73, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":235,\"blog_id\":41}', NULL, 1, '2026-01-04 01:17:16', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(74, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":232,\"question_id\":142}', NULL, 1, '2026-01-04 01:33:15', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(75, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":234,\"event_id\":55}', NULL, 1, '2026-01-04 01:33:44', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(76, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":236,\"blog_id\":42}', NULL, 1, '2026-01-04 01:33:57', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(77, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":246,\"question_id\":146}', NULL, 1, '2026-01-04 13:44:57', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(78, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":247,\"blog_id\":45}', NULL, 1, '2026-01-04 13:45:41', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(79, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":245,\"event_id\":59}', NULL, 1, '2026-01-04 13:49:12', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(80, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":251,\"question_id\":148}', NULL, 1, '2026-01-04 14:09:02', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(81, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":252,\"event_id\":61}', NULL, 1, '2026-01-04 14:09:53', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(82, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":253,\"blog_id\":47}', NULL, 1, '2026-01-04 14:09:59', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(83, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":257,\"event_id\":64}', NULL, 1, '2026-01-04 14:39:04', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(84, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":258,\"blog_id\":49}', NULL, 1, '2026-01-04 14:39:07', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(85, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":259,\"question_id\":149}', NULL, 1, '2026-01-04 14:40:31', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(86, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":264,\"content_type\":\"problem\"}', NULL, 1, '2026-01-04 23:11:13', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(87, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":265,\"question_id\":153}', NULL, 1, '2026-01-04 23:18:25', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(88, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":268,\"question_id\":156}', NULL, 1, '2026-01-05 03:57:16', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(89, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":277,\"event_id\":70}', NULL, 1, '2026-01-05 03:57:27', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(90, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":279,\"blog_id\":52}', NULL, 1, '2026-01-05 03:57:46', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(91, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":269,\"question_id\":157}', NULL, 1, '2026-01-05 11:20:46', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(92, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":269,\"question_id\":157}', NULL, 1, '2026-01-05 11:20:48', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(93, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":270,\"question_id\":158}', NULL, 1, '2026-01-05 11:21:02', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(94, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":272,\"question_id\":160}', NULL, 1, '2026-01-05 12:16:25', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(95, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":282,\"question_id\":161}', NULL, 1, '2026-01-05 12:30:08', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(96, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":283,\"question_id\":162}', NULL, 1, '2026-01-05 12:51:35', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(97, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":284,\"question_id\":163,\"reason\":\"\"}', NULL, 1, '2026-01-05 12:53:59', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(98, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":285,\"question_id\":164,\"reason\":\"\"}', NULL, 1, '2026-01-05 13:03:14', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(99, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":286,\"question_id\":165,\"reason\":\"\"}', NULL, 1, '2026-01-05 13:25:08', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(100, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":290,\"question_id\":169,\"reason\":\"\"}', NULL, 1, '2026-01-05 13:42:13', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(101, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":311,\"question_id\":175}', NULL, 1, '2026-01-05 14:17:43', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(102, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":316,\"event_id\":83}', NULL, 1, '2026-01-05 14:17:50', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(103, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":321,\"blog_id\":66}', NULL, 1, '2026-01-05 14:17:53', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(104, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":315,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 14:22:23', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(105, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":320,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 14:22:27', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(106, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":310,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 14:22:29', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(107, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":314,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 14:22:35', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(108, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":318,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 14:22:39', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(109, 23, 'item_denied', 'pf3', 'Your submission \"pf3\" was denied.', '{\"approval_id\":309,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 14:22:42', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(110, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":312,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 14:38:53', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(111, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":317,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 14:38:56', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(112, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":308,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 14:38:58', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(113, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":324,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 14:43:01', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(114, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":326,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 14:43:03', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(115, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":322,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 14:43:05', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(116, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":325,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 14:43:09', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(117, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":327,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 14:43:12', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(118, 23, 'item_denied', 'pf2', 'Your submission \"pf2\" was denied.', '{\"approval_id\":323,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 14:43:16', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(119, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":322,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 15:12:29', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(120, 23, 'item_denied', 'pf2', 'Your submission \"pf2\" was denied.', '{\"approval_id\":323,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 15:12:31', '2026-01-05 15:35:33', 1, '2026-01-05 23:35:34'),
(121, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":351}', NULL, 0, '2026-01-06 04:17:05', NULL, 0, NULL),
(122, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":354}', NULL, 0, '2026-01-06 04:20:40', NULL, 0, NULL),
(123, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":356}', NULL, 0, '2026-01-06 04:20:59', NULL, 0, NULL),
(124, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":359}', NULL, 0, '2026-01-06 04:21:13', NULL, 0, NULL),
(125, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":363}', NULL, 0, '2026-01-06 04:26:58', NULL, 0, NULL),
(126, 7, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":365}', NULL, 0, '2026-01-06 04:26:58', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications_archieved`
--

CREATE TABLE `notifications_archieved` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` varchar(191) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `message` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `read_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `archived_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications_archieved`
--

INSERT INTO `notifications_archieved` (`id`, `user_id`, `type`, `title`, `message`, `data`, `link`, `is_read`, `created_at`, `read_at`, `deleted_at`, `archived_at`) VALUES
(1, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":141,\"question_id\":25}', NULL, 1, '2025-12-19 10:15:55', '2025-12-19 12:26:16', NULL, '2025-12-19 12:26:18'),
(2, 4, 'question_denied', 'Question Denied', 'Automated test deny', '{\"approval_id\":142,\"question_id\":25,\"reason\":\"Automated test deny\"}', NULL, 1, '2025-12-19 10:18:16', '2025-12-19 12:26:16', NULL, '2025-12-19 12:26:18'),
(3, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":143,\"question_id\":25}', NULL, 1, '2025-12-19 10:39:03', '2025-12-19 12:26:16', NULL, '2025-12-19 12:26:18'),
(4, 4, 'question_denied', 'Question Denied', 'Automated test deny', '{\"approval_id\":144,\"question_id\":25,\"reason\":\"Automated test deny\"}', NULL, 1, '2025-12-19 10:40:22', '2025-12-19 12:26:16', NULL, '2025-12-19 12:26:18'),
(5, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 10:52:04', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(6, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 10:56:46', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(7, 7, 'question_denied', 'Question Denied', 'brooo', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"brooo\"}', NULL, 1, '2025-12-19 10:57:08', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(8, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 11:00:59', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(9, 7, 'question_denied', 'Question Denied', 'boohooo', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"boohooo\"}', NULL, 1, '2025-12-19 11:01:45', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(10, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 11:05:52', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(11, 7, 'question_denied', 'Question Denied', 'no js', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"no js\"}', NULL, 1, '2025-12-19 11:06:22', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(12, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 11:09:17', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(13, 7, 'question_denied', 'Question Denied', 'shit', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"shit\"}', NULL, 1, '2025-12-19 11:10:01', '2025-12-19 11:56:50', NULL, '2025-12-19 11:57:18'),
(16, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 11:58:48', '2025-12-19 11:58:57', NULL, '2025-12-19 11:59:05'),
(17, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 12:27:00', '2025-12-19 12:34:23', NULL, '2025-12-19 12:34:24'),
(18, 7, 'question_denied', 'Question Denied', 'no', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"no\"}', NULL, 1, '2025-12-19 12:34:06', '2025-12-19 12:34:13', NULL, '2025-12-19 12:34:16'),
(19, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 12:34:54', '2025-12-19 12:35:03', NULL, '2025-12-19 12:35:04'),
(20, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 12:35:27', '2025-12-19 12:35:32', NULL, '2025-12-19 12:35:33'),
(21, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 12:38:33', '2025-12-19 12:39:08', NULL, '2025-12-19 12:39:12'),
(22, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 12:39:28', '2025-12-19 12:39:33', NULL, '2025-12-19 12:39:34'),
(23, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":145,\"question_id\":96}', NULL, 1, '2025-12-19 12:57:45', '2025-12-19 12:57:51', NULL, '2025-12-19 12:57:55'),
(24, 7, 'question_denied', 'Question Denied', 'ok', '{\"approval_id\":145,\"question_id\":96,\"reason\":\"ok\"}', NULL, 1, '2025-12-19 12:58:22', '2025-12-19 12:58:33', NULL, '2025-12-19 12:58:34'),
(25, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":149,\"question_id\":98}', NULL, 1, '2025-12-20 00:09:03', '2025-12-20 19:40:07', NULL, '2025-12-20 19:40:08'),
(26, 20, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":156,\"content_type\":\"blog\"}', NULL, 1, '2025-12-20 08:05:24', '2025-12-20 12:24:43', NULL, '2025-12-20 12:24:45'),
(27, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":157,\"question_id\":103}', NULL, 1, '2025-12-20 08:25:57', '2025-12-20 12:24:43', NULL, '2025-12-20 12:24:45'),
(28, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":160,\"question_id\":104}', NULL, 1, '2025-12-20 09:17:01', '2025-12-20 12:24:43', NULL, '2025-12-20 12:24:45'),
(29, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":163,\"question_id\":105}', NULL, 1, '2025-12-20 10:27:14', '2025-12-20 12:24:43', NULL, '2025-12-20 12:24:45'),
(32, 7, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":182,\"question_id\":114}', NULL, 1, '2025-12-20 21:21:48', '2025-12-20 22:37:25', NULL, '2025-12-20 22:37:26'),
(33, 7, 'question_denied', 'Question Denied', 'shit', '{\"approval_id\":183,\"question_id\":115,\"reason\":\"shit\"}', NULL, 1, '2025-12-20 21:44:22', '2025-12-20 22:37:14', NULL, '2025-12-20 22:37:15'),
(34, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":184,\"event_id\":26}', NULL, 1, '2025-12-20 22:02:07', '2025-12-20 22:37:25', NULL, '2025-12-20 22:37:26'),
(35, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":184,\"event_id\":26}', NULL, 1, '2025-12-21 07:42:55', '2025-12-21 19:40:31', NULL, '2025-12-21 19:40:32'),
(36, 7, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":184,\"event_id\":26}', NULL, 1, '2025-12-21 08:25:07', '2025-12-21 19:40:31', NULL, '2025-12-21 19:40:32'),
(37, 7, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":186,\"content_type\":\"blog\"}', NULL, 1, '2025-12-22 09:04:00', '2025-12-30 15:59:06', NULL, '2025-12-30 15:59:06'),
(39, 4, 'item_denied', 'aaaa', 'Your submission \"aaaa\" was denied. s', '{\"approval_id\":126,\"content_type\":\"problem\"}', NULL, 1, '2025-12-23 10:19:11', '2025-12-28 13:04:17', NULL, '2025-12-28 13:04:17'),
(42, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 13:01:31', '2025-12-28 13:04:17', NULL, '2025-12-28 13:04:17'),
(43, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 13:03:00', '2025-12-28 13:04:17', NULL, '2025-12-28 13:04:17'),
(44, 4, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":111,\"question_id\":66}', NULL, 1, '2025-12-28 13:03:47', '2025-12-28 13:04:17', NULL, '2025-12-28 13:04:17'),
(51, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":199,\"question_id\":132}', NULL, 1, '2026-01-03 15:52:57', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:07'),
(52, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":203,\"question_id\":134}', NULL, 1, '2026-01-03 16:31:58', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(53, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":208,\"question_id\":135}', NULL, 1, '2026-01-03 17:23:50', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(54, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":209,\"question_id\":136}', NULL, 1, '2026-01-03 17:50:06', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(55, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":212,\"question_id\":139}', NULL, 1, '2026-01-03 18:55:27', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(56, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":214,\"event_id\":46}', NULL, 1, '2026-01-04 06:48:30', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(57, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":213,\"event_id\":45}', NULL, 1, '2026-01-04 06:48:51', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(58, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":215,\"event_id\":47}', NULL, 1, '2026-01-04 06:50:32', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(59, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":216,\"blog_id\":34}', NULL, 1, '2026-01-04 06:54:54', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(60, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":217,\"blog_id\":35}', NULL, 1, '2026-01-04 06:55:13', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(61, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":219,\"event_id\":49}', NULL, 1, '2026-01-04 07:15:01', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(62, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":221,\"blog_id\":36}', NULL, 1, '2026-01-04 07:15:28', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(63, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":220,\"event_id\":50}', NULL, 1, '2026-01-04 07:15:37', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(64, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":222,\"blog_id\":37}', NULL, 1, '2026-01-04 07:15:41', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(65, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":225,\"event_id\":51}', NULL, 1, '2026-01-04 08:03:36', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(66, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":227,\"blog_id\":38}', NULL, 1, '2026-01-04 08:03:39', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(67, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":226,\"event_id\":52}', NULL, 1, '2026-01-04 08:04:05', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(68, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":228,\"blog_id\":39}', NULL, 1, '2026-01-04 08:04:25', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(69, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":229,\"event_id\":53}', NULL, 1, '2026-01-04 08:29:38', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(70, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":224,\"question_id\":140}', NULL, 1, '2026-01-04 08:29:50', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(71, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":231,\"question_id\":141}', NULL, 1, '2026-01-04 09:16:06', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(72, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":233,\"event_id\":54}', NULL, 1, '2026-01-04 09:17:03', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(73, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":235,\"blog_id\":41}', NULL, 1, '2026-01-04 09:17:16', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(74, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":232,\"question_id\":142}', NULL, 1, '2026-01-04 09:33:15', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(75, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":234,\"event_id\":55}', NULL, 1, '2026-01-04 09:33:44', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(76, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":236,\"blog_id\":42}', NULL, 1, '2026-01-04 09:33:57', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(77, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":246,\"question_id\":146}', NULL, 1, '2026-01-04 21:44:57', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(78, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":247,\"blog_id\":45}', NULL, 1, '2026-01-04 21:45:41', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(79, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":245,\"event_id\":59}', NULL, 1, '2026-01-04 21:49:12', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(80, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":251,\"question_id\":148}', NULL, 1, '2026-01-04 22:09:02', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(81, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":252,\"event_id\":61}', NULL, 1, '2026-01-04 22:09:53', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(82, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":253,\"blog_id\":47}', NULL, 1, '2026-01-04 22:09:59', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(83, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":257,\"event_id\":64}', NULL, 1, '2026-01-04 22:39:04', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(84, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":258,\"blog_id\":49}', NULL, 1, '2026-01-04 22:39:07', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(85, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":259,\"question_id\":149}', NULL, 1, '2026-01-04 22:40:31', '2026-01-05 06:51:05', NULL, '2026-01-05 06:51:08'),
(86, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":264,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 07:11:13', '2026-01-05 19:00:24', NULL, '2026-01-05 19:00:25'),
(87, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":265,\"question_id\":153}', NULL, 1, '2026-01-05 07:18:25', '2026-01-05 19:00:24', NULL, '2026-01-05 19:00:25'),
(88, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":268,\"question_id\":156}', NULL, 1, '2026-01-05 11:57:16', '2026-01-05 19:00:24', NULL, '2026-01-05 19:00:25'),
(89, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":277,\"event_id\":70}', NULL, 1, '2026-01-05 11:57:27', '2026-01-05 19:00:24', NULL, '2026-01-05 19:00:25'),
(90, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":279,\"blog_id\":52}', NULL, 1, '2026-01-05 11:57:46', '2026-01-05 19:00:24', NULL, '2026-01-05 19:00:25'),
(91, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":269,\"question_id\":157}', NULL, 1, '2026-01-05 19:20:46', '2026-01-05 20:49:54', NULL, '2026-01-05 20:49:56'),
(92, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":269,\"question_id\":157}', NULL, 1, '2026-01-05 19:20:48', '2026-01-05 20:49:54', NULL, '2026-01-05 20:49:56'),
(93, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":270,\"question_id\":158}', NULL, 1, '2026-01-05 19:21:02', '2026-01-05 20:49:54', NULL, '2026-01-05 20:49:56'),
(94, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":272,\"question_id\":160}', NULL, 1, '2026-01-05 20:16:25', '2026-01-05 20:49:54', NULL, '2026-01-05 20:49:56'),
(95, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":282,\"question_id\":161}', NULL, 1, '2026-01-05 20:30:08', '2026-01-05 20:49:42', NULL, '2026-01-05 20:49:46'),
(96, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":283,\"question_id\":162}', NULL, 1, '2026-01-05 20:51:35', '2026-01-05 22:10:48', NULL, '2026-01-05 22:10:48'),
(97, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":284,\"question_id\":163,\"reason\":\"\"}', NULL, 1, '2026-01-05 20:53:59', '2026-01-05 22:10:48', NULL, '2026-01-05 22:10:48'),
(98, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":285,\"question_id\":164,\"reason\":\"\"}', NULL, 1, '2026-01-05 21:03:14', '2026-01-05 22:10:48', NULL, '2026-01-05 22:10:48'),
(99, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":286,\"question_id\":165,\"reason\":\"\"}', NULL, 1, '2026-01-05 21:25:08', '2026-01-05 22:10:48', NULL, '2026-01-05 22:10:48'),
(100, 23, 'question_denied', 'Question Denied', 'Your submitted question was denied by an admin.', '{\"approval_id\":290,\"question_id\":169,\"reason\":\"\"}', NULL, 1, '2026-01-05 21:42:13', '2026-01-05 22:10:48', NULL, '2026-01-05 22:10:48'),
(101, 23, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":311,\"question_id\":175}', NULL, 1, '2026-01-05 22:17:43', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(102, 23, 'event_approved', 'Event Approved', 'An admin has approved your event.', '{\"approval_id\":316,\"event_id\":83}', NULL, 1, '2026-01-05 22:17:50', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(103, 23, 'blog_approved', 'Blog Approved', 'An admin has approved your blog.', '{\"approval_id\":321,\"blog_id\":66}', NULL, 1, '2026-01-05 22:17:53', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(104, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":315,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 22:22:23', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(105, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":320,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 22:22:27', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(106, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":310,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 22:22:29', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(107, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":314,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 22:22:35', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(108, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":318,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 22:22:39', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(109, 23, 'item_denied', 'pf3', 'Your submission \"pf3\" was denied.', '{\"approval_id\":309,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 22:22:42', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(110, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":312,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 22:38:53', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(111, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":317,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 22:38:56', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(112, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":308,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 22:38:58', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(113, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":324,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 22:43:01', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(114, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":326,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 22:43:03', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(115, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":322,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 22:43:05', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(116, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":325,\"content_type\":\"event\"}', NULL, 1, '2026-01-05 22:43:09', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(117, 23, 'item_denied', 'Your submission', 'Your submission was denied.', '{\"approval_id\":327,\"content_type\":\"blog\"}', NULL, 1, '2026-01-05 22:43:12', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(118, 23, 'item_denied', 'pf2', 'Your submission \"pf2\" was denied.', '{\"approval_id\":323,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 22:43:16', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(119, 23, 'item_approved', 'Submission Approved', 'Your submission has been approved by an admin.', '{\"approval_id\":322,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 23:12:29', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(120, 23, 'item_denied', 'pf2', 'Your submission \"pf2\" was denied.', '{\"approval_id\":323,\"content_type\":\"problem\"}', NULL, 1, '2026-01-05 23:12:31', '2026-01-05 23:35:33', NULL, '2026-01-05 23:35:34'),
(31, 20, 'question_approved', 'Question Approved', 'An admin has approved your question.', '{\"approval_id\":181,\"question_id\":113}', NULL, 0, '2025-12-20 13:22:03', NULL, NULL, '2026-03-13 19:48:03');

-- --------------------------------------------------------

--
-- Table structure for table `pending_abandonment_notifications`
--

CREATE TABLE `pending_abandonment_notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `penalty_dp` int(11) NOT NULL DEFAULT 0,
  `bonus_dp` int(11) NOT NULL DEFAULT 0,
  `abandon_count` int(11) NOT NULL DEFAULT 0,
  `is_banned` tinyint(1) DEFAULT 0,
  `notification_type` enum('penalty','opponent_abandon') NOT NULL DEFAULT 'penalty',
  `opponent_username` varchar(255) DEFAULT NULL,
  `mode` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `shown_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pending_abandonment_notifications`
--

INSERT INTO `pending_abandonment_notifications` (`notification_id`, `user_id`, `match_id`, `message`, `penalty_dp`, `bonus_dp`, `abandon_count`, `is_banned`, `notification_type`, `opponent_username`, `mode`, `created_at`, `shown_at`) VALUES
(24, 1, 231, 'You abandoned the match. Penalty: -20 DP (1 abandonments)', -20, 0, 1, 0, 'penalty', NULL, 'ranked', '2025-12-16 01:12:33', '2025-12-16 01:13:20'),
(25, 1, 232, 'You abandoned the match. Penalty: -20 DP (2 abandonments)', -20, 0, 2, 0, 'penalty', NULL, 'ranked', '2025-12-16 01:15:55', '2025-12-16 01:16:18'),
(26, 8, 232, 'user0 abandoned the match. You received +10 DP!', 0, 10, 0, 0, 'opponent_abandon', 'user0', 'ranked', '2025-12-16 01:15:55', '2025-12-16 01:15:55'),
(27, 8, 232, 'You abandoned the match. Penalty: -20 DP (1 abandonments)', -20, 0, 1, 0, 'penalty', NULL, 'ranked', '2025-12-16 01:16:47', '2025-12-16 01:18:40'),
(28, 8, 233, 'You abandoned the match. Penalty: -20 DP (2 abandonments)', -20, 0, 2, 0, 'penalty', NULL, 'ranked', '2025-12-16 01:19:21', '2025-12-16 01:19:34'),
(29, 8, 234, 'You abandoned the match and have been banned! (3 abandonments)', -20, 0, 3, 1, 'penalty', NULL, 'ranked', '2025-12-16 01:40:57', '2025-12-16 01:42:43'),
(30, 1, 235, 'You abandoned the match. Penalty: -20 DP (1 abandonments)', -20, 0, 1, 0, 'penalty', NULL, 'ranked', '2025-12-16 01:43:30', '2025-12-16 01:43:52'),
(31, 8, 235, 'You abandoned the match. Penalty: -20 DP (1 abandonments)', -20, 0, 1, 0, 'penalty', NULL, 'ranked', '2025-12-16 01:43:30', '2025-12-16 01:44:03'),
(32, 3, 238, 'You abandoned the match. Penalty: -20 DP (1 abandonments)', -20, 0, 1, 0, 'penalty', NULL, 'ranked', '2025-12-16 06:12:17', '2025-12-16 06:13:16'),
(33, 1, 238, 'user1 abandoned the match. You received +10 DP!', 0, 10, 0, 0, 'opponent_abandon', 'user1', 'ranked', '2025-12-16 06:12:18', '2025-12-16 06:12:18'),
(34, 3, 239, 'You abandoned the match. Penalty: -20 DP (2 abandonments)', -20, 0, 2, 0, 'penalty', NULL, 'ranked', '2025-12-16 06:15:50', '2025-12-16 06:18:24'),
(35, 3, 240, 'You abandoned the match and have been banned! (3 abandonments)', -20, 0, 3, 1, 'penalty', NULL, 'ranked', '2025-12-16 06:20:30', '2025-12-21 00:19:01'),
(36, 1, 253, 'You abandoned the match. Penalty: -20 DP (1 abandonments)', -20, 0, 1, 0, 'penalty', NULL, 'ranked', '2025-12-22 06:06:36', '2025-12-22 06:06:52'),
(37, 3, 253, 'user0 abandoned the match. You received +10 DP!', 0, 10, 0, 0, 'opponent_abandon', 'user0', 'ranked', '2025-12-22 06:06:36', '2025-12-22 06:06:36');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int(11) NOT NULL,
  `permission_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_name`, `description`) VALUES
(1, 'blog.create', 'Create, edit, delete own blogs'),
(2, 'blog.delete.any', 'Delete own and others blogs'),
(3, 'blog.edit.any', 'Edit blogs created by others'),
(4, 'create_own_event', 'Create, edit, delete own events'),
(5, 'delete_any_event', 'Delete own and others events'),
(6, 'event.edit.any', 'Edit events created by others'),
(7, 'manage_event_participants', 'Invite and manage event participants'),
(8, 'create_own_problem', 'Create, edit, delete own question set'),
(9, 'problem.delete.any', 'Delete own and others question set'),
(10, 'edit_other_level_problem', 'Edit problems of other level privileges'),
(11, 'problem.approvals.manage', 'Approve or deny problems below your privilege level'),
(12, 'blog.approvals.manage', 'Approve or deny blogs below your privilege level'),
(13, 'event.approvals.manage', 'Approve or deny events below your privilege level'),
(14, 'ban_users', 'Ban users'),
(15, 'roles.manage', 'Manage user roles'),
(16, 'set_faculty', 'Assign user role to faculty'),
(17, 'set_admin', 'Assign user role to admin');

-- --------------------------------------------------------

--
-- Table structure for table `permissions_backup_20251222`
--

CREATE TABLE `permissions_backup_20251222` (
  `permission_id` int(11) NOT NULL DEFAULT 0,
  `permission_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions_backup_20251222`
--

INSERT INTO `permissions_backup_20251222` (`permission_id`, `permission_name`, `description`, `category`) VALUES
(1, 'create_own_blog', 'Create, edit, delete own blogs', NULL),
(2, 'delete_any_blog', 'Delete own and others blogs', NULL),
(3, 'edit_any_blog', 'Edit blogs created by others', NULL),
(4, 'create_own_event', 'Create, edit, delete own events', NULL),
(5, 'delete_any_event', 'Delete own and others events', NULL),
(6, 'edit_any_event', 'Edit events created by others', NULL),
(7, 'manage_event_participants', 'Invite and manage event participants', NULL),
(8, 'create_own_problem', 'Create, edit, delete own question set', NULL),
(9, 'delete_any_problem', 'Delete own and others question set', NULL),
(10, 'edit_other_level_problem', 'Edit problems of other level privileges', NULL),
(11, 'approve_problem', 'Approve or deny problems below your privilege level', NULL),
(12, 'approve_blog', 'Approve or deny blogs below your privilege level', NULL),
(13, 'approve_event', 'Approve or deny events below your privilege level', NULL),
(14, 'ban_users', 'Ban users', NULL),
(15, 'manage_roles', 'Manage user roles', NULL),
(16, 'set_faculty', 'Assign user role to faculty', NULL),
(17, 'set_admin', 'Assign user role to admin', NULL),
(18, 'faculty_view_dashboard', 'View faculty dashboard and analytics', NULL),
(19, 'faculty_edit_own_profile', 'Edit own profile and account settings', NULL),
(20, 'faculty_view_users', 'View users and profiles', NULL),
(21, 'faculty_manage_users', 'Create, edit, delete user accounts (requires two-level approval)', NULL),
(22, 'faculty_create_problems', 'Create new problem sets', NULL),
(23, 'faculty_auto_approve_problems', 'Auto-approve problems (no pending approval)', NULL),
(24, 'faculty_manage_events', 'Create, edit, delete events (requires approval if no auto-approve)', NULL),
(25, 'faculty_auto_approve_events', 'Auto-approve events (no pending approval)', NULL),
(26, 'faculty_manage_blogs', 'Create, edit, delete blog posts (requires approval if no auto-approve)', NULL),
(27, 'faculty_auto_approve_blogs', 'Auto-approve blogs (no pending approval)', NULL),
(28, 'faculty_manage_approvals', 'Review and approve/deny faculty submissions', NULL),
(29, 'faculty_submit_for_review', 'Submit changes for faculty/admin review', NULL),
(30, 'faculty_can_request_user_admin_changes', 'Request changes to users/admins (requires two-level approval)', NULL),
(32, 'deny_problem', 'Deny pending problems/questions', 'question set'),
(34, 'deny_event', 'Deny pending events', 'event'),
(36, 'deny_blog', 'Deny pending blog posts', 'blog'),
(37, 'blog.create', 'Create own blog posts', 'blog'),
(38, 'blog.edit.own', 'Edit own blog posts', 'blog'),
(39, 'blog.edit.any', 'Edit any blog post', 'blog'),
(40, 'blog.delete.own', 'Delete own blog posts', 'blog'),
(41, 'blog.delete.any', 'Delete any blog post', 'blog'),
(42, 'blog.approvals.manage', 'Approve or deny blog submissions', 'blog'),
(43, 'blog.auto_approve', 'Automatically approve blog submissions', 'blog'),
(44, 'event.create', 'Create events (own)', 'event'),
(45, 'event.edit.own', 'Edit own events', 'event'),
(46, 'event.edit.any', 'Edit any event', 'event'),
(47, 'event.delete.own', 'Delete own events', 'event'),
(48, 'event.delete.any', 'Delete any event', 'event'),
(49, 'event.participants.manage', 'Invite/manage participants for events', 'event'),
(50, 'event.approvals.manage', 'Approve or deny event submissions', 'event'),
(51, 'event.auto_approve', 'Automatically approve event submissions', 'event'),
(52, 'problem.create', 'Create problem sets (own)', 'problem'),
(53, 'problem.edit.own', 'Edit own problem sets', 'problem'),
(54, 'problem.edit.any', 'Edit any problem set', 'problem'),
(55, 'problem.delete.any', 'Delete any problem set', 'problem'),
(56, 'problem.approvals.manage', 'Approve or deny problem submissions', 'problem'),
(57, 'problem.auto_approve', 'Automatically approve problem submissions', 'problem'),
(58, 'approvals.manage', 'Global approvals management (approve/deny across categories)', 'approvals'),
(59, 'users.view', 'View user list and profiles', 'users'),
(60, 'users.manage', 'Create/edit/delete users', 'users'),
(61, 'users.request_admin_changes', 'Request admin-level user changes (two-level review)', 'users'),
(62, 'roles.manage', 'Manage roles and permissions', 'roles'),
(63, 'roles.assign.faculty', 'Assign faculty role to users', 'roles'),
(64, 'roles.assign.admin', 'Assign admin role to users', 'roles'),
(65, 'admin.ban_users', 'Ban users from the system', 'admin'),
(66, 'faculty.view_dashboard', 'View faculty dashboard and analytics (UI toggle)', 'faculty'),
(67, 'faculty.submit_for_review', 'Submit changes for faculty/admin review', 'faculty');

-- --------------------------------------------------------

--
-- Table structure for table `problems`
--

CREATE TABLE `problems` (
  `problem_id` int(11) NOT NULL,
  `problem_name` varchar(255) NOT NULL,
  `difficulty` varchar(20) DEFAULT NULL,
  `time_limit_seconds` int(11) DEFAULT NULL,
  `memory_limit_mb` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `problems`
--

INSERT INTO `problems` (`problem_id`, `problem_name`, `difficulty`, `time_limit_seconds`, `memory_limit_mb`, `description`) VALUES
(100, 'Hello World', 'Easy', 1, 32, 'Print the text exactly as shown below.\n\nInput: (none)\nOutput: Hello World'),
(101, 'Print Your Name', 'Easy', 1, 32, 'Read a name and print a greeting.\n\nInput: Alice\nOutput: Hello, Alice!'),
(102, 'Add Two Numbers', 'Easy', 1, 32, 'Read two numbers on separate lines. Print their sum.\n\nInput:\n5\n3\nOutput: 8'),
(103, 'Multiply Two Numbers', 'Easy', 1, 32, 'Read two numbers on separate lines. Print their product.\n\nInput:\n3\n4\nOutput: 12'),
(104, 'Is Even or Odd', 'Easy', 1, 32, 'Read a number. Print \"Even\" if it is even, \"Odd\" if it is odd.\n\nInput: 4\nOutput: Even\n\nInput: 7\nOutput: Odd'),
(105, 'Print Numbers 1 to N', 'Easy', 1, 32, 'Read a number N. Print all numbers from 1 to N, one per line.\n\nInput: 3\nOutput:\n1\n2\n3'),
(106, 'Sum 1 to N', 'Easy', 1, 32, 'Read a number N. Print the sum of all numbers from 1 to N.\n\nInput: 5\nOutput: 15\n\nExplanation: 1+2+3+4+5 = 15'),
(107, 'Count Down', 'Easy', 1, 32, 'Read a number N. Print numbers from N down to 1, one per line.\n\nInput: 3\nOutput:\n3\n2\n1'),
(108, 'Bigger Number', 'Easy', 1, 32, 'Read two numbers on separate lines. Print the bigger one.\n\nInput:\n5\n3\nOutput: 5'),
(109, 'Repeat Word', 'Easy', 1, 32, 'Read a word and a number N on separate lines. Print the word N times, one per line.\n\nInput:\nhi\n3\nOutput:\nhi\nhi\nhi'),
(110, 'Count Even Numbers', 'Medium', 1, 64, 'Read N numbers (first line is N, then one number per line).\nCount how many are even.\n\nInput:\n5\n1\n2\n3\n4\n5\nOutput: 2'),
(111, 'Find the Largest', 'Medium', 1, 64, 'Read N numbers (first line is N, then one per line). Print the largest.\n\nInput:\n4\n3\n7\n1\n9\nOutput: 9'),
(112, 'Sum of Even Numbers', 'Medium', 1, 64, 'Read N numbers (first line is N, then one per line).\nPrint the sum of even numbers only.\n\nInput:\n6\n1\n2\n3\n4\n5\n6\nOutput: 12'),
(113, 'Reverse a String', 'Medium', 1, 64, 'Read a string. Print it reversed.\n\nInput: hello\nOutput: olleh'),
(114, 'Count Vowels', 'Medium', 1, 64, 'Read a string. Count the number of vowels (a, e, i, o, u — uppercase and lowercase).\n\nInput: hello\nOutput: 2\n\nExplanation: e and o are vowels'),
(115, 'Multiplication Table', 'Medium', 1, 64, 'Read a number N. Print its multiplication table from 1 to 10.\nFormat each line as: N x i = result\n\nInput: 2\nOutput:\n2 x 1 = 2\n2 x 2 = 4\n...'),
(116, 'FizzBuzz', 'Medium', 1, 64, 'Read a number N. For each number from 1 to N:\n- Print \"FizzBuzz\" if divisible by both 3 and 5\n- Print \"Fizz\" if divisible by 3 only\n- Print \"Buzz\" if divisible by 5 only\n- Otherwise print the number\n\nInput: 5\nOutput:\n1\n2\nFizz\n4\nBuzz'),
(117, 'Is Palindrome', 'Medium', 1, 64, 'Read a string. Print \"Yes\" if it is a palindrome, \"No\" otherwise.\nA palindrome reads the same forwards and backwards.\n\nInput: racecar\nOutput: Yes\n\nInput: hello\nOutput: No'),
(118, 'Find First Duplicate', 'Hard', 2, 128, 'Read N numbers (first line is N, then one per line).\nFind the first number that appears more than once. Print it, or -1 if none.\n\nInput:\n6\n2\n1\n3\n5\n3\n2\nOutput: 3\n\nExplanation: 3 appears again before 2'),
(119, 'Two Sum', 'Hard', 2, 128, 'Read N numbers (first line is N, then one per line), then a target on the last line.\nPrint two indices (0-based, space-separated) whose values add up to the target.\n\nInput:\n4\n2\n7\n11\n15\n9\nOutput: 0 1\n\nExplanation: nums[0]=2 and nums[1]=7 add up to 9'),
(120, 'Valid Parentheses', 'Hard', 2, 128, 'Read a string of brackets: (), [], {}.\nPrint \"true\" if all brackets are properly matched and closed, \"false\" otherwise.\n\nInput: ()[]{}\nOutput: true\n\nInput: (]\nOutput: false'),
(121, 'Longest No-Repeat Substring', 'Hard', 2, 128, 'Read a string. Print the length of the longest substring without any repeating characters.\n\nInput: abcabcbb\nOutput: 3\n\nExplanation: \"abc\" is the longest substring without repeats (length 3)'),
(122, 'Count Words in Sentence', 'Hard', 2, 128, 'Read a sentence. Count how many words it contains.\nWords are separated by single spaces.\n\nInput: hello world\nOutput: 2');

-- --------------------------------------------------------

--
-- Table structure for table `problems_have_topics`
--

CREATE TABLE `problems_have_topics` (
  `problem_id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `problems_have_topics`
--

INSERT INTO `problems_have_topics` (`problem_id`, `topic_id`) VALUES
(100, 7),
(101, 7),
(102, 3),
(102, 7),
(103, 3),
(103, 7),
(104, 3),
(104, 7),
(105, 8),
(105, 3),
(106, 8),
(106, 3),
(107, 8),
(107, 3),
(108, 3),
(108, 7),
(109, 8),
(109, 7),
(110, 8),
(110, 3),
(111, 8),
(111, 3),
(112, 8),
(112, 3),
(113, 2),
(114, 2),
(115, 8),
(115, 3),
(116, 8),
(116, 3),
(117, 2),
(118, 1),
(119, 1),
(119, 3),
(120, 2),
(121, 2),
(122, 2),
(122, 3);

-- --------------------------------------------------------

--
-- Table structure for table `problem_submissions`
--

CREATE TABLE `problem_submissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `problem_test_runs`
--

CREATE TABLE `problem_test_runs` (
  `test_run_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `passed` int(11) DEFAULT 0,
  `total` int(11) DEFAULT 0,
  `verdict` varchar(50) DEFAULT NULL,
  `results` longtext DEFAULT NULL,
  `score` int(11) DEFAULT 0,
  `result` varchar(50) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `problem_topics`
--

CREATE TABLE `problem_topics` (
  `topic_id` int(11) NOT NULL,
  `topic_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `problem_topics`
--

INSERT INTO `problem_topics` (`topic_id`, `topic_name`, `description`, `created_at`) VALUES
(1, 'Array', 'Problems involving arrays, lists, and indexing', '2025-12-12 21:15:40'),
(2, 'String', 'Problems involving string manipulation and patterns', '2025-12-12 21:15:40'),
(3, 'Math', 'Problems involving mathematical algorithms and number theory', '2025-12-12 21:15:40'),
(4, 'Graph', 'Problems involving graph traversal and connectivity', '2025-12-12 21:15:40'),
(5, 'Tree', 'Problems involving binary trees and tree algorithms', '2025-12-12 21:15:40'),
(6, 'Dynamic Programming', 'Problems requiring DP solutions and optimization', '2025-12-12 21:15:40'),
(7, 'Basic I/O', 'Problems focusing on reading input and printing output', '2026-04-02 10:00:01'),
(8, 'Loop', 'Problems solved using for/while loop constructs', '2026-04-02 10:00:01');

-- --------------------------------------------------------

--
-- Table structure for table `problem_user_progression`
--

CREATE TABLE `problem_user_progression` (
  `id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `progress` enum('complete','unfinished','untouch','') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `problem_user_progression_draft_code`
--

CREATE TABLE `problem_user_progression_draft_code` (
  `id` int(11) NOT NULL,
  `problem_user_progress_id` int(11) NOT NULL,
  `problem_user_progress_code` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `problem_user_progression_draft_code`
--

INSERT INTO `problem_user_progression_draft_code` (`id`, `problem_user_progress_id`, `problem_user_progress_code`) VALUES
(1, 2, 'function solution() {\n  // TODO: Complete this solution\n  return null;\n}'),
(2, 4, 'def solve(n):\n    # Work in progress\n    pass');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`profile_id`, `user_id`, `full_name`, `bio`, `avatar_url`) VALUES
(1, 4, 'Cant Prove it yet', NULL, 'asset/profile/avatar_4_1765288736673.jpg'),
(2, 5, 'Its Who?', NULL, 'asset/profile/avatar_5_1765092617803.jpg'),
(4, 7, 'James Sunderland', NULL, 'asset/profile/avatar_7_1765289722252.jpg'),
(0, 20, 'user3', NULL, NULL),
(0, 21, 'admin_test', NULL, NULL),
(0, 1, 'user0', '', ''),
(0, 3, 'user1', '', ''),
(0, 8, 'user2', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `role_level` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `role_level`) VALUES
(1, 'user', 1),
(2, 'faculty', 2),
(3, 'admin', 3);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_permission_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_permission_id`, `role_id`, `permission_id`) VALUES
(1, 2, 12),
(2, 2, 13),
(3, 2, 11),
(4, 2, 1),
(5, 2, 4),
(6, 2, 8),
(7, 2, 2),
(8, 2, 5),
(9, 2, 9),
(10, 2, 3),
(11, 2, 6),
(12, 2, 10),
(13, 2, 7),
(16, 3, 12),
(17, 3, 13),
(18, 3, 11),
(19, 3, 14),
(20, 3, 1),
(21, 3, 4),
(22, 3, 8),
(23, 3, 2),
(24, 3, 5),
(25, 3, 9),
(26, 3, 3),
(27, 3, 6),
(28, 3, 10),
(29, 3, 7),
(30, 3, 15),
(31, 3, 17),
(32, 3, 16),
(137, 1, 37),
(138, 1, 38),
(139, 1, 40),
(140, 1, 44),
(141, 1, 45),
(142, 1, 47),
(143, 1, 52),
(144, 1, 53),
(145, 1, 59),
(146, 2, 37),
(147, 2, 38),
(149, 2, 40),
(151, 2, 44),
(152, 2, 45),
(154, 2, 47),
(155, 2, 49),
(162, 2, 66),
(163, 2, 67),
(164, 3, 37),
(165, 3, 38),
(166, 3, 39),
(167, 3, 40),
(168, 3, 41),
(169, 3, 42),
(170, 3, 43),
(171, 3, 44),
(172, 3, 45),
(173, 3, 46),
(174, 3, 47),
(175, 3, 48),
(176, 3, 49),
(177, 3, 50),
(178, 3, 51),
(179, 3, 52),
(180, 3, 53),
(181, 3, 54),
(182, 3, 55),
(183, 3, 56),
(184, 3, 57),
(185, 3, 58),
(186, 3, 59),
(187, 3, 60),
(188, 3, 61),
(189, 3, 62),
(190, 3, 63),
(191, 3, 64),
(192, 3, 65),
(193, 3, 66),
(194, 3, 67);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `host_id` int(11) NOT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 1,
  `pin_code` varchar(10) DEFAULT NULL,
  `player_limit` int(11) DEFAULT 10,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `starts_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `room_link` varchar(255) DEFAULT NULL,
  `status` enum('waiting','ongoing','finished','expired') DEFAULT 'waiting'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_activity_log`
--

CREATE TABLE `room_activity_log` (
  `log_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `logged_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_players`
--

CREATE TABLE `room_players` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_ready` tinyint(1) DEFAULT 0,
  `score` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `solution_submissions`
--

CREATE TABLE `solution_submissions` (
  `submission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `submission_code` text NOT NULL,
  `result` enum('pending','passed','failed') DEFAULT 'pending',
  `score` int(11) DEFAULT 0,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spectator_sessions`
--

CREATE TABLE `spectator_sessions` (
  `session_id` int(11) NOT NULL,
  `spectator_user_id` int(11) NOT NULL COMMENT 'User ID of the spectator',
  `lobby_id` int(11) NOT NULL COMMENT 'Lobby being spectated',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `left_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Track spectator viewing sessions';

--
-- Dumping data for table `spectator_sessions`
--

INSERT INTO `spectator_sessions` (`session_id`, `spectator_user_id`, `lobby_id`, `joined_at`, `left_at`) VALUES
(2, 1, 97, '2025-12-21 22:05:54', NULL),
(3, 1, 103, '2025-12-22 07:54:52', NULL),
(4, 1, 104, '2025-12-22 08:27:43', '2025-12-22 08:46:24'),
(5, 1, 104, '2025-12-22 08:30:00', '2025-12-22 08:46:24'),
(6, 1, 104, '2025-12-22 08:46:24', '2025-12-22 08:46:31'),
(7, 1, 104, '2025-12-22 08:46:31', NULL),
(8, 8, 105, '2025-12-22 09:37:04', NULL),
(9, 1, 106, '2025-12-22 09:52:18', NULL),
(10, 1, 107, '2025-12-22 10:21:57', NULL),
(11, 1, 108, '2025-12-27 12:55:05', NULL),
(12, 1, 109, '2025-12-27 13:29:20', '2025-12-27 13:38:58'),
(13, 1, 109, '2025-12-27 13:38:58', '2025-12-27 13:38:59'),
(14, 1, 109, '2025-12-27 13:38:59', NULL),
(15, 8, 110, '2025-12-27 13:44:19', '2025-12-27 13:49:10'),
(16, 8, 110, '2025-12-27 13:49:10', NULL),
(17, 3, 111, '2025-12-27 14:09:42', NULL),
(18, 3, 112, '2025-12-27 14:23:04', NULL),
(19, 1, 114, '2025-12-27 15:09:56', NULL),
(20, 1, 114, '2025-12-27 20:36:24', NULL),
(21, 1, 115, '2025-12-27 20:43:48', NULL),
(22, 1, 117, '2025-12-27 21:42:49', NULL),
(23, 1, 118, '2025-12-27 22:06:10', NULL),
(24, 1, 118, '2025-12-27 22:08:19', NULL),
(25, 1, 118, '2025-12-27 22:11:27', NULL),
(26, 1, 118, '2025-12-27 22:22:44', NULL),
(27, 1, 119, '2025-12-27 22:28:25', NULL),
(28, 1, 121, '2025-12-28 00:06:09', NULL),
(29, 1, 122, '2025-12-28 01:29:20', NULL),
(30, 1, 122, '2025-12-29 02:02:33', NULL),
(31, 1, 123, '2025-12-29 02:49:18', '2025-12-29 03:14:56'),
(32, 1, 123, '2025-12-29 03:14:12', '2025-12-29 03:14:56'),
(33, 1, 123, '2025-12-29 03:14:56', NULL),
(34, 1, 123, '2025-12-29 03:51:51', NULL),
(35, 1, 123, '2025-12-29 05:02:36', NULL),
(36, 1, 127, '2025-12-29 07:06:10', '2025-12-29 07:15:33'),
(37, 1, 127, '2025-12-29 07:15:33', NULL),
(38, 1, 132, '2025-12-30 00:59:26', NULL),
(39, 1, 133, '2025-12-30 02:04:25', NULL),
(40, 1, 133, '2025-12-30 02:13:23', NULL),
(41, 8, 137, '2025-12-30 03:01:08', NULL),
(42, 1, 139, '2025-12-30 03:51:24', NULL),
(43, 1, 140, '2025-12-30 04:29:33', NULL),
(44, 1, 141, '2025-12-30 05:07:49', NULL),
(45, 1, 143, '2025-12-30 06:18:36', NULL),
(46, 1, 143, '2025-12-30 06:22:13', NULL),
(47, 1, 145, '2025-12-30 06:30:54', NULL),
(48, 1, 146, '2025-12-30 06:59:43', NULL),
(49, 1, 147, '2025-12-30 07:18:59', NULL),
(50, 3, 148, '2025-12-30 07:42:10', NULL),
(51, 8, 149, '2025-12-30 07:59:43', NULL),
(0, 3, 178, '2026-03-13 16:56:27', NULL),
(0, 3, 179, '2026-03-13 17:10:39', NULL),
(0, 3, 179, '2026-03-13 17:10:40', NULL),
(0, 3, 179, '2026-03-13 17:10:41', NULL),
(0, 3, 179, '2026-03-13 17:10:42', NULL),
(0, 3, 179, '2026-03-13 17:10:42', NULL),
(0, 3, 179, '2026-03-13 17:10:44', NULL),
(0, 3, 179, '2026-03-13 17:10:46', NULL),
(0, 3, 179, '2026-03-13 17:10:48', NULL),
(0, 3, 179, '2026-03-13 17:10:51', NULL),
(0, 3, 179, '2026-03-13 17:10:53', NULL),
(0, 3, 179, '2026-03-13 17:10:56', NULL),
(0, 3, 179, '2026-03-13 17:10:58', NULL),
(0, 3, 180, '2026-03-13 20:32:25', NULL),
(0, 3, 180, '2026-03-13 20:32:26', NULL),
(0, 3, 180, '2026-03-13 20:32:27', NULL),
(0, 3, 180, '2026-03-13 20:32:28', NULL),
(0, 3, 180, '2026-03-13 20:32:28', NULL),
(0, 3, 180, '2026-03-13 20:32:30', NULL),
(0, 3, 180, '2026-03-13 20:32:32', NULL),
(0, 3, 180, '2026-03-13 20:32:34', NULL),
(0, 3, 180, '2026-03-13 20:32:37', NULL),
(0, 3, 180, '2026-03-13 20:32:39', NULL),
(0, 3, 180, '2026-03-13 20:32:42', NULL),
(0, 3, 180, '2026-03-13 20:32:44', NULL),
(0, 3, 181, '2026-03-13 20:47:48', NULL),
(0, 20, 182, '2026-03-13 20:53:22', NULL),
(0, 3, 184, '2026-03-13 21:00:03', NULL),
(0, 3, 184, '2026-03-13 21:00:04', NULL),
(0, 3, 184, '2026-03-13 21:00:05', NULL),
(0, 3, 184, '2026-03-13 21:00:06', NULL),
(0, 3, 184, '2026-03-13 21:00:06', NULL),
(0, 3, 184, '2026-03-13 21:00:08', NULL),
(0, 3, 184, '2026-03-13 21:00:10', NULL),
(0, 3, 184, '2026-03-13 21:00:12', NULL),
(0, 3, 184, '2026-03-13 21:00:15', NULL),
(0, 3, 184, '2026-03-13 21:00:17', NULL),
(0, 3, 184, '2026-03-13 21:00:20', NULL),
(0, 3, 184, '2026-03-13 21:00:22', NULL),
(0, 3, 185, '2026-03-13 21:02:44', NULL),
(0, 3, 185, '2026-03-13 21:04:11', NULL),
(0, 3, 186, '2026-03-13 21:12:44', NULL),
(0, 3, 186, '2026-03-13 21:13:38', NULL),
(0, 3, 186, '2026-03-13 21:14:55', NULL),
(0, 3, 186, '2026-03-13 21:34:59', NULL),
(0, 3, 187, '2026-03-13 21:38:23', NULL),
(0, 3, 187, '2026-03-13 21:39:16', NULL),
(0, 3, 187, '2026-03-13 21:39:50', NULL),
(0, 3, 187, '2026-03-13 21:44:54', NULL),
(0, 3, 187, '2026-03-13 21:45:32', NULL),
(0, 3, 187, '2026-03-13 21:47:18', NULL),
(0, 3, 187, '2026-03-13 21:48:49', NULL),
(0, 3, 188, '2026-03-13 21:54:01', NULL),
(0, 3, 188, '2026-03-13 21:55:08', NULL),
(0, 3, 188, '2026-03-13 21:56:33', NULL),
(0, 3, 188, '2026-03-13 22:06:55', NULL),
(0, 3, 189, '2026-03-13 22:07:40', NULL),
(0, 3, 189, '2026-03-13 22:09:09', NULL),
(0, 3, 189, '2026-03-13 22:11:01', NULL),
(0, 3, 190, '2026-03-13 22:22:21', NULL),
(0, 3, 190, '2026-03-13 22:23:40', NULL),
(0, 3, 190, '2026-03-13 22:24:54', NULL),
(0, 3, 191, '2026-03-13 22:43:15', NULL),
(0, 3, 191, '2026-03-13 22:44:26', NULL),
(0, 3, 191, '2026-03-13 22:45:24', NULL),
(0, 3, 197, '2026-03-31 02:56:16', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `statistic`
--

CREATE TABLE `statistic` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `statistic_level` int(11) NOT NULL,
  `statistic_level_xp` int(11) NOT NULL,
  `statistic_duel_point` int(11) NOT NULL,
  `abandon_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of times user abandoned onboarding',
  `is_banned` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = banned from matchmaking, 0 = active',
  `last_abandon_at` timestamp NULL DEFAULT NULL COMMENT 'Last time user abandoned a match'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statistic`
--

INSERT INTO `statistic` (`id`, `user_id`, `statistic_level`, `statistic_level_xp`, `statistic_duel_point`, `abandon_count`, `is_banned`, `last_abandon_at`) VALUES
(1, 4, 67, 420, 61, 0, 0, NULL),
(2, 7, 666, 66, 666666, 0, 0, NULL),
(3, 1, 4, 4988, 101, 1, 0, '2025-12-22 06:06:36'),
(4, 3, 3, 4226, 0, 0, 0, '2025-12-16 06:20:30'),
(5, 8, 2, 1320, 62, 0, 0, '2025-12-16 01:43:30'),
(0, 20, 1, 0, 0, 0, 0, NULL),
(0, 21, 1, 0, 0, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_backup`
--

CREATE TABLE `system_backup` (
  `backup_id` int(11) NOT NULL,
  `backup_name` varchar(100) NOT NULL,
  `backup_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_cases`
--

CREATE TABLE `test_cases` (
  `test_case_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `test_case_number` int(11) NOT NULL,
  `is_sample` tinyint(1) DEFAULT 0,
  `input_data` text DEFAULT NULL,
  `expected_output` text DEFAULT NULL,
  `score` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_cases`
--

INSERT INTO `test_cases` (`test_case_id`, `problem_id`, `test_case_number`, `is_sample`, `input_data`, `expected_output`, `score`) VALUES
(47, 100, 1, 1, '', 'Hello World', 0),
(48, 100, 2, 1, '', 'Hello World', 0),
(49, 100, 3, 1, '', 'Hello World', 0),
(50, 100, 4, 0, '', 'Hello World', 11),
(51, 100, 5, 0, '', 'Hello World', 11),
(52, 100, 6, 0, '', 'Hello World', 11),
(53, 100, 7, 0, '', 'Hello World', 11),
(54, 100, 8, 0, '', 'Hello World', 11),
(55, 100, 9, 0, '', 'Hello World', 11),
(56, 100, 10, 0, '', 'Hello World', 11),
(57, 100, 11, 0, '', 'Hello World', 11),
(58, 100, 12, 0, '', 'Hello World', 11),
(59, 101, 1, 1, 'Alice', 'Hello, Alice!', 0),
(60, 101, 2, 1, 'Bob', 'Hello, Bob!', 0),
(61, 101, 3, 1, 'Maria', 'Hello, Maria!', 0),
(62, 101, 4, 0, 'Juan', 'Hello, Juan!', 11),
(63, 101, 5, 0, 'Carlo', 'Hello, Carlo!', 11),
(64, 101, 6, 0, 'Ana', 'Hello, Ana!', 11),
(65, 101, 7, 0, 'Pedro', 'Hello, Pedro!', 11),
(66, 101, 8, 0, 'Lisa', 'Hello, Lisa!', 11),
(67, 101, 9, 0, 'James', 'Hello, James!', 11),
(68, 101, 10, 0, 'Elena', 'Hello, Elena!', 11),
(69, 101, 11, 0, 'Marco', 'Hello, Marco!', 11),
(70, 101, 12, 0, 'Nina', 'Hello, Nina!', 11),
(71, 102, 1, 1, '5\n3', '8', 0),
(72, 102, 2, 1, '10\n20', '30', 0),
(73, 102, 3, 1, '0\n0', '0', 0),
(74, 102, 4, 0, '-5\n5', '0', 11),
(75, 102, 5, 0, '100\n200', '300', 11),
(76, 102, 6, 0, '-10\n-20', '-30', 11),
(77, 102, 7, 0, '999\n1', '1000', 11),
(78, 102, 8, 0, '0\n100', '100', 11),
(79, 102, 9, 0, '50\n50', '100', 11),
(80, 102, 10, 0, '1\n1', '2', 11),
(81, 102, 11, 0, '-1\n-1', '-2', 11),
(82, 102, 12, 0, '7\n8', '15', 11),
(83, 103, 1, 1, '3\n4', '12', 0),
(84, 103, 2, 1, '5\n5', '25', 0),
(85, 103, 3, 1, '0\n99', '0', 0),
(86, 103, 4, 0, '7\n8', '56', 11),
(87, 103, 5, 0, '-2\n3', '-6', 11),
(88, 103, 6, 0, '10\n10', '100', 11),
(89, 103, 7, 0, '1\n1', '1', 11),
(90, 103, 8, 0, '-3\n-3', '9', 11),
(91, 103, 9, 0, '6\n7', '42', 11),
(92, 103, 10, 0, '2\n50', '100', 11),
(93, 103, 11, 0, '9\n9', '81', 11),
(94, 103, 12, 0, '0\n0', '0', 11),
(95, 104, 1, 1, '4', 'Even', 0),
(96, 104, 2, 1, '7', 'Odd', 0),
(97, 104, 3, 1, '0', 'Even', 0),
(98, 104, 4, 0, '1', 'Odd', 11),
(99, 104, 5, 0, '100', 'Even', 11),
(100, 104, 6, 0, '13', 'Odd', 11),
(101, 104, 7, 0, '-2', 'Even', 11),
(102, 104, 8, 0, '-5', 'Odd', 11),
(103, 104, 9, 0, '2', 'Even', 11),
(104, 104, 10, 0, '99', 'Odd', 11),
(105, 104, 11, 0, '50', 'Even', 11),
(106, 104, 12, 0, '1001', 'Odd', 11),
(107, 105, 1, 1, '3', '1\n2\n3', 0),
(108, 105, 2, 1, '5', '1\n2\n3\n4\n5', 0),
(109, 105, 3, 1, '1', '1', 0),
(110, 105, 4, 0, '2', '1\n2', 11),
(111, 105, 5, 0, '4', '1\n2\n3\n4', 11),
(112, 105, 6, 0, '6', '1\n2\n3\n4\n5\n6', 11),
(113, 105, 7, 0, '7', '1\n2\n3\n4\n5\n6\n7', 11),
(114, 105, 8, 0, '8', '1\n2\n3\n4\n5\n6\n7\n8', 11),
(115, 105, 9, 0, '9', '1\n2\n3\n4\n5\n6\n7\n8\n9', 11),
(116, 105, 10, 0, '10', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10', 11),
(117, 105, 11, 0, '11', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11', 11),
(118, 105, 12, 0, '12', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12', 11),
(119, 106, 1, 1, '5', '15', 0),
(120, 106, 2, 1, '10', '55', 0),
(121, 106, 3, 1, '1', '1', 0),
(122, 106, 4, 0, '3', '6', 11),
(123, 106, 5, 0, '100', '5050', 11),
(124, 106, 6, 0, '2', '3', 11),
(125, 106, 7, 0, '4', '10', 11),
(126, 106, 8, 0, '6', '21', 11),
(127, 106, 9, 0, '7', '28', 11),
(128, 106, 10, 0, '8', '36', 11),
(129, 106, 11, 0, '9', '45', 11),
(130, 106, 12, 0, '20', '210', 11),
(131, 107, 1, 1, '3', '3\n2\n1', 0),
(132, 107, 2, 1, '5', '5\n4\n3\n2\n1', 0),
(133, 107, 3, 1, '1', '1', 0),
(134, 107, 4, 0, '2', '2\n1', 11),
(135, 107, 5, 0, '4', '4\n3\n2\n1', 11),
(136, 107, 6, 0, '6', '6\n5\n4\n3\n2\n1', 11),
(137, 107, 7, 0, '7', '7\n6\n5\n4\n3\n2\n1', 11),
(138, 107, 8, 0, '8', '8\n7\n6\n5\n4\n3\n2\n1', 11),
(139, 107, 9, 0, '9', '9\n8\n7\n6\n5\n4\n3\n2\n1', 11),
(140, 107, 10, 0, '10', '10\n9\n8\n7\n6\n5\n4\n3\n2\n1', 11),
(141, 107, 11, 0, '11', '11\n10\n9\n8\n7\n6\n5\n4\n3\n2\n1', 11),
(142, 107, 12, 0, '12', '12\n11\n10\n9\n8\n7\n6\n5\n4\n3\n2\n1', 11),
(143, 108, 1, 1, '5\n3', '5', 0),
(144, 108, 2, 1, '2\n8', '8', 0),
(145, 108, 3, 1, '10\n10', '10', 0),
(146, 108, 4, 0, '-1\n-5', '-1', 11),
(147, 108, 5, 0, '0\n1', '1', 11),
(148, 108, 6, 0, '100\n99', '100', 11),
(149, 108, 7, 0, '-3\n0', '0', 11),
(150, 108, 8, 0, '7\n7', '7', 11),
(151, 108, 9, 0, '50\n51', '51', 11),
(152, 108, 10, 0, '1000\n999', '1000', 11),
(153, 108, 11, 0, '-10\n10', '10', 11),
(154, 108, 12, 0, '3\n30', '30', 11),
(155, 109, 1, 1, 'hi\n3', 'hi\nhi\nhi', 0),
(156, 109, 2, 1, 'yes\n2', 'yes\nyes', 0),
(157, 109, 3, 1, 'ok\n1', 'ok', 0),
(158, 109, 4, 0, 'go\n4', 'go\ngo\ngo\ngo', 11),
(159, 109, 5, 0, 'code\n3', 'code\ncode\ncode', 11),
(160, 109, 6, 0, 'run\n5', 'run\nrun\nrun\nrun\nrun', 11),
(161, 109, 7, 0, 'ha\n2', 'ha\nha', 11),
(162, 109, 8, 0, 'no\n3', 'no\nno\nno', 11),
(163, 109, 9, 0, 'wow\n4', 'wow\nwow\nwow\nwow', 11),
(164, 109, 10, 0, 'abc\n2', 'abc\nabc', 11),
(165, 109, 11, 0, 'x\n5', 'x\nx\nx\nx\nx', 11),
(166, 109, 12, 0, 'done\n1', 'done', 11),
(167, 110, 1, 1, '5\n1\n2\n3\n4\n5', '2', 0),
(168, 110, 2, 1, '3\n2\n4\n6', '3', 0),
(169, 110, 3, 1, '3\n1\n3\n5', '0', 0),
(170, 110, 4, 0, '4\n0\n1\n2\n3', '2', 11),
(171, 110, 5, 0, '1\n8', '1', 11),
(172, 110, 6, 0, '6\n10\n11\n12\n13\n14\n15', '3', 11),
(173, 110, 7, 0, '2\n7\n9', '0', 11),
(174, 110, 8, 0, '4\n2\n4\n6\n8', '4', 11),
(175, 110, 9, 0, '3\n-2\n-3\n-4', '2', 11),
(176, 110, 10, 0, '5\n0\n0\n0\n0\n0', '5', 11),
(177, 110, 11, 0, '3\n100\n200\n300', '3', 11),
(178, 110, 12, 0, '2\n1\n2', '1', 11),
(179, 111, 1, 1, '4\n3\n7\n1\n9', '9', 0),
(180, 111, 2, 1, '3\n5\n5\n5', '5', 0),
(181, 111, 3, 1, '3\n-1\n-2\n-3', '-1', 0),
(182, 111, 4, 0, '1\n42', '42', 11),
(183, 111, 5, 0, '5\n1\n2\n3\n4\n5', '5', 11),
(184, 111, 6, 0, '4\n100\n200\n50\n150', '200', 11),
(185, 111, 7, 0, '3\n0\n0\n1', '1', 11),
(186, 111, 8, 0, '2\n-10\n-20', '-10', 11),
(187, 111, 9, 0, '5\n9\n8\n7\n6\n5', '9', 11),
(188, 111, 10, 0, '3\n1000\n999\n998', '1000', 11),
(189, 111, 11, 0, '4\n-5\n-3\n-7\n-1', '-1', 11),
(190, 111, 12, 0, '2\n50\n50', '50', 11),
(191, 112, 1, 1, '6\n1\n2\n3\n4\n5\n6', '12', 0),
(192, 112, 2, 1, '3\n1\n3\n5', '0', 0),
(193, 112, 3, 1, '3\n2\n4\n6', '12', 0),
(194, 112, 4, 0, '4\n10\n15\n20\n25', '30', 11),
(195, 112, 5, 0, '1\n0', '0', 11),
(196, 112, 6, 0, '4\n-2\n-4\n1\n3', '-6', 11),
(197, 112, 7, 0, '5\n100\n101\n102\n103\n104', '306', 11),
(198, 112, 8, 0, '2\n7\n9', '0', 11),
(199, 112, 9, 0, '3\n2\n2\n2', '6', 11),
(200, 112, 10, 0, '4\n0\n1\n2\n3', '2', 11),
(201, 112, 11, 0, '3\n1000\n2000\n3000', '6000', 11),
(202, 112, 12, 0, '2\n11\n22', '22', 11),
(203, 113, 1, 1, 'hello', 'olleh', 0),
(204, 113, 2, 1, 'world', 'dlrow', 0),
(205, 113, 3, 1, 'Python', 'nohtyP', 0),
(206, 113, 4, 0, 'abcde', 'edcba', 11),
(207, 113, 5, 0, 'racecar', 'racecar', 11),
(208, 113, 6, 0, '12345', '54321', 11),
(209, 113, 7, 0, 'ab', 'ba', 11),
(210, 113, 8, 0, 'a', 'a', 11),
(211, 113, 9, 0, 'Hello World', 'dlroW olleH', 11),
(212, 113, 10, 0, '!@#$%', '%$#@!', 11),
(213, 113, 11, 0, 'AaBbCc', 'cCbBaA', 11),
(214, 113, 12, 0, 'abcdefghij', 'jihgfedcba', 11),
(215, 114, 1, 1, 'hello', '2', 0),
(216, 114, 2, 1, 'AEIOU', '5', 0),
(217, 114, 3, 1, 'rhythm', '0', 0),
(218, 114, 4, 0, 'Programming', '3', 11),
(219, 114, 5, 0, 'Beautiful', '5', 11),
(220, 114, 6, 0, 'aeiouAEIOU', '10', 11),
(221, 114, 7, 0, 'bcdfg', '0', 11),
(222, 114, 8, 0, 'The Quick Brown Fox', '5', 11),
(223, 114, 9, 0, 'a', '1', 11),
(224, 114, 10, 0, 'z', '0', 11),
(225, 114, 11, 0, '12345', '0', 11),
(226, 114, 12, 0, 'umbrella', '3', 11),
(227, 115, 1, 1, '2', '2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n2 x 10 = 20', 0),
(228, 115, 2, 1, '5', '5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50', 0),
(229, 115, 3, 1, '1', '1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10', 0),
(230, 115, 4, 0, '3', '3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30', 11),
(231, 115, 5, 0, '10', '10 x 1 = 10\n10 x 2 = 20\n10 x 3 = 30\n10 x 4 = 40\n10 x 5 = 50\n10 x 6 = 60\n10 x 7 = 70\n10 x 8 = 80\n10 x 9 = 90\n10 x 10 = 100', 11),
(232, 115, 6, 0, '4', '4 x 1 = 4\n4 x 2 = 8\n4 x 3 = 12\n4 x 4 = 16\n4 x 5 = 20\n4 x 6 = 24\n4 x 7 = 28\n4 x 8 = 32\n4 x 9 = 36\n4 x 10 = 40', 11),
(233, 115, 7, 0, '6', '6 x 1 = 6\n6 x 2 = 12\n6 x 3 = 18\n6 x 4 = 24\n6 x 5 = 30\n6 x 6 = 36\n6 x 7 = 42\n6 x 8 = 48\n6 x 9 = 54\n6 x 10 = 60', 11),
(234, 115, 8, 0, '7', '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70', 11),
(235, 115, 9, 0, '8', '8 x 1 = 8\n8 x 2 = 16\n8 x 3 = 24\n8 x 4 = 32\n8 x 5 = 40\n8 x 6 = 48\n8 x 7 = 56\n8 x 8 = 64\n8 x 9 = 72\n8 x 10 = 80', 11),
(236, 115, 10, 0, '9', '9 x 1 = 9\n9 x 2 = 18\n9 x 3 = 27\n9 x 4 = 36\n9 x 5 = 45\n9 x 6 = 54\n9 x 7 = 63\n9 x 8 = 72\n9 x 9 = 81\n9 x 10 = 90', 11),
(237, 115, 11, 0, '11', '11 x 1 = 11\n11 x 2 = 22\n11 x 3 = 33\n11 x 4 = 44\n11 x 5 = 55\n11 x 6 = 66\n11 x 7 = 77\n11 x 8 = 88\n11 x 9 = 99\n11 x 10 = 110', 11),
(238, 115, 12, 0, '12', '12 x 1 = 12\n12 x 2 = 24\n12 x 3 = 36\n12 x 4 = 48\n12 x 5 = 60\n12 x 6 = 72\n12 x 7 = 84\n12 x 8 = 96\n12 x 9 = 108\n12 x 10 = 120', 11),
(239, 116, 1, 1, '5', '1\n2\nFizz\n4\nBuzz', 0),
(240, 116, 2, 1, '15', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', 0),
(241, 116, 3, 1, '3', '1\n2\nFizz', 0),
(242, 116, 4, 0, '1', '1', 11),
(243, 116, 5, 0, '6', '1\n2\nFizz\n4\nBuzz\nFizz', 11),
(244, 116, 6, 0, '10', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz', 11),
(245, 116, 7, 0, '2', '1\n2', 11),
(246, 116, 8, 0, '4', '1\n2\nFizz\n4', 11),
(247, 116, 9, 0, '7', '1\n2\nFizz\n4\nBuzz\nFizz\n7', 11),
(248, 116, 10, 0, '9', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz', 11),
(249, 116, 11, 0, '12', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz', 11),
(250, 116, 12, 0, '20', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz', 11),
(251, 117, 1, 1, 'racecar', 'Yes', 0),
(252, 117, 2, 1, 'hello', 'No', 0),
(253, 117, 3, 1, 'madam', 'Yes', 0),
(254, 117, 4, 0, 'python', 'No', 11),
(255, 117, 5, 0, 'a', 'Yes', 11),
(256, 117, 6, 0, 'abba', 'Yes', 11),
(257, 117, 7, 0, 'abc', 'No', 11),
(258, 117, 8, 0, 'level', 'Yes', 11),
(259, 117, 9, 0, 'noon', 'Yes', 11),
(260, 117, 10, 0, 'world', 'No', 11),
(261, 117, 11, 0, 'civic', 'Yes', 11),
(262, 117, 12, 0, 'kayak', 'Yes', 11),
(263, 118, 1, 1, '6\n2\n1\n3\n5\n3\n2', '3', 0),
(264, 118, 2, 1, '4\n1\n2\n3\n4', '-1', 0),
(265, 118, 3, 1, '2\n5\n5', '5', 0),
(266, 118, 4, 0, '5\n7\n2\n3\n7\n1', '7', 11),
(267, 118, 5, 0, '5\n11\n22\n33\n44\n55', '-1', 11),
(268, 118, 6, 0, '3\n10\n10\n10', '10', 11),
(269, 118, 7, 0, '6\n9\n8\n7\n6\n5\n4', '-1', 11),
(270, 118, 8, 0, '4\n1\n2\n1\n2', '1', 11),
(271, 118, 9, 0, '5\n-1\n-2\n-1\n3\n4', '-1', 11),
(272, 118, 10, 0, '3\n0\n1\n0', '0', 11),
(273, 118, 11, 0, '5\n100\n200\n300\n100\n400', '100', 11),
(274, 118, 12, 0, '4\n99\n98\n97\n99', '99', 11),
(275, 119, 1, 1, '4\n2\n7\n11\n15\n9', '0 1', 0),
(276, 119, 2, 1, '3\n3\n2\n4\n6', '1 2', 0),
(277, 119, 3, 1, '2\n1\n2\n3', '0 1', 0),
(278, 119, 4, 0, '5\n1\n2\n3\n4\n5\n9', '3 4', 11),
(279, 119, 5, 0, '4\n10\n20\n30\n40\n70', '2 3', 11),
(280, 119, 6, 0, '3\n-1\n0\n1\n0', '0 2', 11),
(281, 119, 7, 0, '4\n5\n5\n5\n5\n10', '0 1', 11),
(282, 119, 8, 0, '3\n100\n200\n300\n500', '1 2', 11),
(283, 119, 9, 0, '2\n0\n4\n4', '0 1', 11),
(284, 119, 10, 0, '4\n15\n11\n7\n2\n9', '2 3', 11),
(285, 119, 11, 0, '2\n8\n8\n16', '0 1', 11),
(286, 119, 12, 0, '4\n99\n1\n2\n3\n100', '0 1', 11),
(287, 120, 1, 1, '()', 'true', 0),
(288, 120, 2, 1, '()[]{}', 'true', 0),
(289, 120, 3, 1, '(]', 'false', 0),
(290, 120, 4, 0, '{[]}', 'true', 11),
(291, 120, 5, 0, '([)]', 'false', 11),
(292, 120, 6, 0, '((', 'false', 11),
(293, 120, 7, 0, '))', 'false', 11),
(294, 120, 8, 0, '(())', 'true', 11),
(295, 120, 9, 0, '{[()]}', 'true', 11),
(296, 120, 10, 0, '{[(])}', 'false', 11),
(297, 120, 11, 0, '((()))', 'true', 11),
(298, 120, 12, 0, '{{{', 'false', 11),
(299, 121, 1, 1, 'abcabcbb', '3', 0),
(300, 121, 2, 1, 'bbbbb', '1', 0),
(301, 121, 3, 1, 'pwwkew', '3', 0),
(302, 121, 4, 0, 'abcdefg', '7', 11),
(303, 121, 5, 0, 'dvdf', '3', 11),
(304, 121, 6, 0, 'a', '1', 11),
(305, 121, 7, 0, 'aab', '2', 11),
(306, 121, 8, 0, 'abba', '2', 11),
(307, 121, 9, 0, 'tmmzuxt', '5', 11),
(308, 121, 10, 0, 'aaaaaaa', '1', 11),
(309, 121, 11, 0, 'abcde', '5', 11),
(310, 121, 12, 0, 'aabbcc', '2', 11),
(311, 122, 1, 1, 'hello world', '2', 0),
(312, 122, 2, 1, 'I love coding', '3', 0),
(313, 122, 3, 1, 'one', '1', 0),
(314, 122, 4, 0, 'the quick brown fox', '4', 11),
(315, 122, 5, 0, 'a b c d e', '5', 11),
(316, 122, 6, 0, 'programming is fun', '3', 11),
(317, 122, 7, 0, 'go', '1', 11),
(318, 122, 8, 0, 'to be or not to be', '6', 11),
(319, 122, 9, 0, 'one two three four five six seven', '7', 11),
(320, 122, 10, 0, 'hello', '1', 11),
(321, 122, 11, 0, 'yes no maybe', '3', 11),
(322, 122, 12, 0, 'code duel game app', '4', 11);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'user0', 'user0@gmail.com', '$2b$10$DJlpSlQWNnb.cuK2rHapMutTcEAioZeHrtwFSh9BU1YwX5.CvuSJS', 'user', '2025-11-26 23:17:24'),
(3, 'user1', 'user1@gmail.com', '$2b$10$rurXNlUj3aj9RdvsDZfurunVTiluOnH34yhCfrtl0yL.FqIJ56lJa', 'user', '2025-11-30 00:05:43'),
(4, 'admin test', 'admin@gmail.com', '$2b$10$xJ17Nr9ugsokNAAgAt/EV.pOoQluRbKiqxWlltAPsWGtSiQp4i/DC', 'admin', '2025-12-07 07:26:45'),
(5, 'Its Who?', 'something@gmail.com', '$2b$10$OlpXSLSFHH.sQlnzxAcMiudT3oYmomTlcdA15zB365MdOxlB4hLeW', 'user', '2025-12-07 07:29:36'),
(7, 'Faculty Test', 'faculty@gmail.com', '$2b$10$qifq9TH01e7JD5598Y7O6uPWn9qZ7UEpipNde2sC8uo8t2fMtJTRe', 'user', '2025-12-09 14:13:48'),
(8, 'user2', 'user2@gmail.com', '$2b$10$5RIzQNb8mTRmhj.7PJn7lOHU1WS9gBYjaA5JNioQPc73D/GSwDbHa', 'user', '2025-12-13 22:43:06'),
(20, 'user3', 'user3@gmail.com', '$2b$10$XJ1LdkCb9TmXVisYGtRi8OB.fy.ijDrijkzFWaII3mgVf4aaDlim6', 'user', '2026-03-13 11:39:27'),
(21, 'admin_test', 'admin@duelcode.com', '$2b$10$KeRwVEw8Np0QqXZCzJM1rOJQHXAnk.BbFntlPooDZApSo7mIdLZCC', 'admin', '2026-04-03 23:41:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `user_permission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `is_granted` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_at`) VALUES
(1, 4, 3, '2025-12-09 11:24:23'),
(2, 7, 2, '2025-12-10 07:43:53'),
(3, 5, 1, '2025-12-10 09:46:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_sessions`
--
ALTER TABLE `active_sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `approvals`
--
ALTER TABLE `approvals`
  ADD PRIMARY KEY (`approval_id`);

--
-- Indexes for table `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD PRIMARY KEY (`audit_id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`blog_id`);

--
-- Indexes for table `blog_likes`
--
ALTER TABLE `blog_likes`
  ADD PRIMARY KEY (`like_id`);

--
-- Indexes for table `duel_lobby_rooms`
--
ALTER TABLE `duel_lobby_rooms`
  ADD PRIMARY KEY (`lobby_id`);

--
-- Indexes for table `duel_matches`
--
ALTER TABLE `duel_matches`
  ADD PRIMARY KEY (`match_id`);

--
-- Indexes for table `lobby_rounds`
--
ALTER TABLE `lobby_rounds`
  ADD PRIMARY KEY (`round_id`),
  ADD KEY `idx_lobby_round` (`lobby_id`,`round_number`);

--
-- Indexes for table `problem_test_runs`
--
ALTER TABLE `problem_test_runs`
  ADD PRIMARY KEY (`test_run_id`),
  ADD KEY `idx_problem_id` (`problem_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `test_cases`
--
ALTER TABLE `test_cases`
  ADD PRIMARY KEY (`test_case_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_sessions`
--
ALTER TABLE `active_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=266;

--
-- AUTO_INCREMENT for table `approvals`
--
ALTER TABLE `approvals`
  MODIFY `approval_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `audit_trail`
--
ALTER TABLE `audit_trail`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `blog_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `blog_likes`
--
ALTER TABLE `blog_likes`
  MODIFY `like_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `duel_lobby_rooms`
--
ALTER TABLE `duel_lobby_rooms`
  MODIFY `lobby_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=199;

--
-- AUTO_INCREMENT for table `duel_matches`
--
ALTER TABLE `duel_matches`
  MODIFY `match_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=289;

--
-- AUTO_INCREMENT for table `lobby_rounds`
--
ALTER TABLE `lobby_rounds`
  MODIFY `round_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `problem_test_runs`
--
ALTER TABLE `problem_test_runs`
  MODIFY `test_run_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `test_cases`
--
ALTER TABLE `test_cases`
  MODIFY `test_case_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=323;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
