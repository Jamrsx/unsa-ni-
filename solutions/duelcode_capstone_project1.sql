-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 30, 2025 at 04:58 PM
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
  `expires_at` timestamp NOT NULL DEFAULT cast(current_timestamp() + interval 7 day as datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_sessions`
--

INSERT INTO `active_sessions` (`session_id`, `user_id`, `token`, `created_at`, `expires_at`) VALUES
(183, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NDQ0Mzh9.T9WrhcS2YgUKpEtrHvMX6R7DQpwTt65vKVUMyZg4Zmg', '2025-12-27 14:07:18', '2026-01-03 14:07:18'),
(184, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NDQ0NDh9.tMG1pOj1ismiKxrhB1HlCyBTewCKRsFm95E4Cij5_yM', '2025-12-27 14:07:28', '2026-01-03 14:07:28'),
(185, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NzEzODV9.Lz2IYq3-fGnXIuxARzt2hVbZEuNWUXwL90BuUNI7QNI', '2025-12-27 21:36:25', '2026-01-03 21:36:25'),
(186, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NzI4OTl9.uj-gDncxkvGAqUTTnVyhCHBAgf2ociBYeGTsjbEiKB4', '2025-12-27 22:01:39', '2026-01-03 22:01:39'),
(187, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NzI5MDh9.siTPlg3WmqfKBDWPSzNynsYKT07-Vgw-2O5SqjGpLZ0', '2025-12-27 22:01:48', '2026-01-03 22:01:48'),
(188, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NzI5MDh9.siTPlg3WmqfKBDWPSzNynsYKT07-Vgw-2O5SqjGpLZ0', '2025-12-27 22:01:48', '2026-01-03 22:01:48'),
(189, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NzI5MTF9.fdkbThvsGzFdEVY_jV6Zu6j7arL5wI1o3qdtOS8Y3NE', '2025-12-27 22:01:51', '2026-01-03 22:01:51'),
(190, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NzkzMzh9._TciFOPggOdvM8O8a6jcKVJFFvZaUaQJ8dnzscs0OWk', '2025-12-27 23:48:58', '2026-01-03 23:48:58'),
(191, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY4NzkzNDF9.qBopUUL7vfRt-tH6Cp7_QdDKwSxJNg_RnE8S5QnfUsk', '2025-12-27 23:49:01', '2026-01-03 23:49:01'),
(192, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODQ4MTR9.oMp65fzeAOpWtTN3bYkT-9Is0DDSn--SRlwut2AK8Js', '2025-12-29 05:06:54', '2026-01-05 05:06:54'),
(193, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODQ4MTV9.Ah_8m_Tt-lakJYRKiJ5O8n4LGXkcyclEwSLOl3C4YW4', '2025-12-29 05:06:55', '2026-01-05 05:06:55'),
(194, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODQ4MTV9.Ah_8m_Tt-lakJYRKiJ5O8n4LGXkcyclEwSLOl3C4YW4', '2025-12-29 05:06:56', '2026-01-05 05:06:56'),
(195, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODQ4NDJ9.KWLNkrB7PIqzhnMBnNsgAjGhizyhT3G8cPtA_CCiV10', '2025-12-29 05:07:23', '2026-01-05 05:07:23'),
(196, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODc5MjJ9.ZXDxoI5cIOxLiVdFUPDu4AaMTpDJu3r7i1hk2jdqZuI', '2025-12-29 05:58:42', '2026-01-05 05:58:42'),
(197, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODc5Mjd9.NQtj7dvp6w9JnXxvd_l6kSpMoywYrBmJjQi227Pbdw0', '2025-12-29 05:58:47', '2026-01-05 05:58:47'),
(198, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODc5NTR9.IX7uyrR91_r4ZlqGw5dTuTUcTtDH7p-hm9CmLN2Akgc', '2025-12-29 05:59:14', '2026-01-05 05:59:14'),
(199, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODgyMTN9.DsyWEAlMrwc9khcUr6OZThLwx44dyHXK5UvTT-EyIpk', '2025-12-29 06:03:33', '2026-01-05 06:03:33'),
(200, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5ODg2NjZ9.AqpsZ5mxG7_0gZqb_O3PPjQMBIFWj9z0neQd38_fxUY', '2025-12-29 06:11:06', '2026-01-05 06:11:06'),
(201, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5OTg1NTB9.2fS4OGsGvd9lnfEhnkU9P1Ir4cFryiNFdXkcYrERXdQ', '2025-12-29 08:55:51', '2026-01-05 08:55:51'),
(202, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjY5OTg2MDd9.tffquCkvnR7CQcGwmNsVwRfovku52GxK0OF1a0BuXoY', '2025-12-29 08:56:47', '2026-01-05 08:56:47'),
(203, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNTg4NTl9.X3HGto1dvpBmirYWzdBXUex-FRcT0Wt6RdKkE5GnmIg', '2025-12-30 01:40:59', '2026-01-06 01:40:59'),
(204, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNTk2NjF9.JFi-_ciRquTnlRvTttnaTJaqKIzMwJa4CmeNkMsUmWA', '2025-12-30 01:54:21', '2026-01-06 01:54:21'),
(205, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNTk5MTV9.OiDpU_eCdxRtqKsLtIZpzxNbCPOwAGsc_6iDReRZ9ws', '2025-12-30 01:58:35', '2026-01-06 01:58:35'),
(206, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNjExMjZ9.mWA035kxkfsp00wKwtM5sVLJPQv4hHUsdvP9lIODJt4', '2025-12-30 02:18:46', '2026-01-06 02:18:46'),
(207, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNjExNDB9.zHduobEG8b_3VVrlSZZCv9ZzSDPLjJJghzvVszb3PAE', '2025-12-30 02:19:00', '2026-01-06 02:19:00'),
(208, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNjExNDV9.PYGqXoLl8FHdODhKkPL2muRkvkpojoF6rTHjHXXP8P4', '2025-12-30 02:19:05', '2026-01-06 02:19:05'),
(209, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNzg3Njh9.zqnvRCksT95iiu5g2Uu_R0Z_TDEejlF5X8Js9yvMbHw', '2025-12-30 07:12:48', '2026-01-06 07:12:48'),
(210, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNzg3Nzh9.FXE15yPa_eJODQq1IiB9mOkt6sZMBsWDUY7ZMfmaFYk', '2025-12-30 07:12:58', '2026-01-06 07:12:58'),
(211, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwNzg3Nzh9.V2aZgOyTlwQAurzyng-_Y-RKn6QbsOmR5On5OhvLGg8', '2025-12-30 07:12:58', '2026-01-06 07:12:58'),
(212, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwODEyMjB9.1_-vd61uWnPZ2CwL2U9ALr_164NrUdl1v9wSmjgS45E', '2025-12-30 07:53:40', '2026-01-06 07:53:40'),
(213, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMiIsImVtYWlsIjoidXNlcjJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwODEyMjN9.QSs3RbDgKXCd5SIBZ7P2Ub3BBhvqctiIhgu6T-ro9JM', '2025-12-30 07:53:44', '2026-01-06 07:53:44'),
(214, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwODEyMjd9.zS_l0WRxAPlHePm97dLDr2yt2NZsiunHkfKKlpapaWQ', '2025-12-30 07:53:47', '2026-01-06 07:53:47'),
(215, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwODk3Mzd9.6ZFSa-2gVxzo7e4Q8VnLBkP1di5ZvTCzyBgGLxJ-X3Q', '2025-12-30 10:15:37', '2026-01-06 10:15:37'),
(216, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwOTM0NDF9.Xd4BE78qqeWSeos9GEsaCgCyec2CodCOkRiB-zU7dE8', '2025-12-30 11:17:21', '2026-01-06 11:17:21'),
(217, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwOTM0NDR9.HceSzcVlCM8iDwZ93buRRuyyn77g3bb2fO6eBftfc2U', '2025-12-30 11:17:24', '2026-01-06 11:17:24'),
(218, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwOTk1ODV9.zl5KAVH7yBhvpuUjcNNt-rRWIrFuYkqYLUkxPi3as28', '2025-12-30 12:59:45', '2026-01-06 12:59:45'),
(219, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcwOTk1ODh9.g4TEljmqrfcRp_Xqtf3ztAOlRVvKu2Pt1OFmILDZyPg', '2025-12-30 12:59:48', '2026-01-06 12:59:48'),
(220, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ1c2VyMCIsImVtYWlsIjoidXNlcjBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcxMDY2OTV9.bITa4knvADIV0Ou3G3BtBThM9ckcR2L1cJpsay9UKIo', '2025-12-30 14:58:15', '2026-01-06 14:58:15'),
(221, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ1c2VyMSIsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJhdmF0YXJfdXJsIjpudWxsLCJpYXQiOjE3NjcxMDY2OTh9.97rRPssRQzPqRCCMVHTUehbCuNEnd58tWyw1YxD0BxI', '2025-12-30 14:58:18', '2026-01-06 14:58:18');

-- --------------------------------------------------------

--
-- Table structure for table `approvals`
--

CREATE TABLE `approvals` (
  `approval_id` int(11) NOT NULL,
  `content_item_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
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
(30, 33, 7, NULL, 'pending', 'Problem awaiting test validation', '2025-12-10 11:40:04', '2025-12-10 11:40:04');

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
(31, 'problem', '2025-12-10 11:40:04'),
(32, 'problem', '2025-12-10 11:40:04'),
(33, 'problem', '2025-12-10 11:40:04');

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
(31, 1),
(32, 2),
(33, 3);

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
(173, 153, 3, 'FUKK YUU EZICKLEE', '2025-12-30 08:49:46');

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
  `left_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `duel_lobby_players`
--

INSERT INTO `duel_lobby_players` (`lobby_player_id`, `lobby_id`, `user_id`, `joined_at`, `is_ready`, `score`, `completion_time`, `verdict`, `left_at`) VALUES
(117, 76, 3, '2025-12-21 01:10:45', 1, NULL, NULL, NULL, '2025-12-21 02:06:07'),
(118, 76, 1, '2025-12-21 01:10:55', 1, NULL, NULL, NULL, NULL),
(165, 97, 3, '2025-12-21 22:04:52', 1, NULL, NULL, NULL, '2025-12-21 22:08:43'),
(166, 97, 8, '2025-12-21 22:04:59', 1, NULL, NULL, NULL, '2025-12-21 22:05:51'),
(168, 97, 1, '2025-12-21 22:08:22', 1, NULL, NULL, NULL, '2025-12-21 22:08:24'),
(172, 103, 3, '2025-12-22 07:53:11', 1, NULL, NULL, NULL, '2025-12-22 07:54:51'),
(173, 103, 8, '2025-12-22 07:54:26', 1, NULL, NULL, NULL, '2025-12-22 07:54:54'),
(176, 104, 3, '2025-12-22 08:22:24', 1, NULL, NULL, NULL, '2025-12-22 08:27:42'),
(177, 104, 8, '2025-12-22 08:22:51', 1, NULL, NULL, NULL, '2025-12-22 08:27:41'),
(179, 105, 1, '2025-12-22 09:33:27', 1, NULL, NULL, NULL, '2025-12-22 09:36:52'),
(180, 105, 3, '2025-12-22 09:34:36', 1, NULL, NULL, NULL, '2025-12-22 09:37:01'),
(182, 106, 8, '2025-12-22 09:50:44', 1, NULL, NULL, NULL, '2025-12-22 09:53:44'),
(183, 106, 3, '2025-12-22 09:50:48', 1, NULL, NULL, NULL, '2025-12-22 09:53:41'),
(188, 107, 3, '2025-12-22 10:20:38', 1, NULL, NULL, NULL, '2025-12-22 10:23:21'),
(189, 107, 8, '2025-12-22 10:20:41', 1, NULL, NULL, NULL, '2025-12-22 10:23:19'),
(193, 108, 3, '2025-12-27 12:49:58', 1, NULL, NULL, NULL, '2025-12-27 12:55:04'),
(194, 108, 8, '2025-12-27 12:54:30', 1, NULL, NULL, NULL, '2025-12-27 12:55:05'),
(196, 109, 3, '2025-12-27 13:28:22', 1, NULL, NULL, NULL, '2025-12-27 13:29:19'),
(197, 109, 8, '2025-12-27 13:28:42', 1, NULL, NULL, NULL, '2025-12-27 13:29:15'),
(199, 110, 3, '2025-12-27 13:43:34', 1, NULL, NULL, NULL, '2025-12-27 13:44:09'),
(200, 110, 1, '2025-12-27 13:43:40', 1, NULL, NULL, NULL, NULL),
(202, 111, 1, '2025-12-27 14:08:46', 1, NULL, NULL, NULL, '2025-12-27 14:09:42'),
(203, 111, 8, '2025-12-27 14:08:48', 1, NULL, NULL, NULL, '2025-12-27 14:09:45'),
(204, 111, 3, '2025-12-27 14:18:43', 1, NULL, NULL, NULL, '2025-12-27 14:18:57'),
(206, 112, 1, '2025-12-27 14:21:53', 1, NULL, NULL, NULL, '2025-12-27 14:23:07'),
(207, 112, 8, '2025-12-27 14:21:53', 1, NULL, NULL, NULL, '2025-12-27 14:23:09'),
(212, 114, 3, '2025-12-27 15:08:55', 1, NULL, NULL, NULL, '2025-12-27 15:41:50'),
(213, 114, 8, '2025-12-27 15:09:03', 1, NULL, NULL, NULL, '2025-12-27 15:41:51'),
(217, 115, 8, '2025-12-27 20:40:47', 1, NULL, NULL, NULL, '2025-12-27 20:43:40'),
(218, 115, 3, '2025-12-27 20:40:49', 1, NULL, NULL, NULL, '2025-12-27 20:43:39'),
(225, 117, 8, '2025-12-27 21:40:59', 1, NULL, NULL, NULL, '2025-12-27 21:42:54'),
(226, 117, 3, '2025-12-27 21:41:03', 1, NULL, NULL, NULL, '2025-12-27 21:42:52'),
(230, 118, 3, '2025-12-27 22:03:57', 1, NULL, NULL, NULL, '2025-12-27 22:18:17'),
(231, 118, 8, '2025-12-27 22:04:18', 1, NULL, NULL, NULL, '2025-12-27 22:18:12'),
(234, 118, 1, '2025-12-27 22:23:43', 1, NULL, NULL, NULL, '2025-12-27 22:24:01'),
(236, 119, 8, '2025-12-27 22:27:30', 1, NULL, NULL, NULL, '2025-12-27 22:28:20'),
(237, 119, 3, '2025-12-27 22:27:42', 1, NULL, NULL, NULL, '2025-12-27 22:28:17'),
(243, 121, 3, '2025-12-27 23:52:09', 1, NULL, NULL, NULL, '2025-12-28 00:06:02'),
(244, 121, 8, '2025-12-27 23:56:58', 1, NULL, NULL, NULL, '2025-12-28 00:06:03'),
(247, 121, 1, '2025-12-28 00:05:53', 1, NULL, NULL, NULL, '2025-12-28 00:06:07'),
(252, 122, 8, '2025-12-28 01:24:22', 1, NULL, NULL, NULL, '2025-12-28 01:29:12'),
(253, 122, 3, '2025-12-28 01:28:17', 1, NULL, NULL, NULL, '2025-12-28 01:29:09'),
(257, 123, 3, '2025-12-29 02:46:29', 1, NULL, NULL, NULL, '2025-12-29 03:14:05'),
(258, 123, 8, '2025-12-29 02:48:51', 1, NULL, NULL, NULL, '2025-12-29 03:13:50'),
(263, 126, 1, '2025-12-29 06:03:11', 1, NULL, NULL, NULL, '2025-12-29 06:12:57'),
(264, 126, 8, '2025-12-29 06:03:44', 1, NULL, NULL, NULL, '2025-12-29 06:40:05'),
(265, 126, 3, '2025-12-29 06:04:46', 1, NULL, NULL, NULL, '2025-12-29 06:36:51'),
(270, 127, 3, '2025-12-29 07:04:26', 1, NULL, NULL, NULL, '2025-12-29 07:06:06'),
(271, 127, 8, '2025-12-29 07:04:31', 1, NULL, NULL, NULL, '2025-12-29 07:06:00'),
(275, 128, 1, '2025-12-29 07:46:36', 1, NULL, NULL, NULL, NULL),
(276, 128, 8, '2025-12-29 07:47:28', 1, NULL, NULL, NULL, '2025-12-29 07:49:35'),
(285, 132, 3, '2025-12-30 00:57:03', 1, NULL, NULL, NULL, '2025-12-30 00:59:17'),
(286, 132, 8, '2025-12-30 00:57:04', 1, NULL, NULL, NULL, '2025-12-30 00:59:13'),
(289, 132, 1, '2025-12-30 01:20:38', 1, NULL, NULL, NULL, NULL),
(291, 133, 3, '2025-12-30 01:59:28', 1, NULL, NULL, NULL, '2025-12-30 02:13:20'),
(292, 133, 8, '2025-12-30 02:03:31', 1, NULL, NULL, NULL, '2025-12-30 02:13:20'),
(298, 134, 3, '2025-12-30 02:21:05', 1, NULL, NULL, NULL, NULL),
(299, 134, 8, '2025-12-30 02:21:15', 1, NULL, NULL, NULL, NULL),
(301, 136, 8, '2025-12-30 02:34:22', 1, NULL, NULL, NULL, '2025-12-30 02:40:28'),
(302, 136, 3, '2025-12-30 02:35:46', 1, NULL, NULL, NULL, '2025-12-30 02:40:32'),
(303, 137, 3, '2025-12-30 02:45:23', 1, NULL, NULL, NULL, '2025-12-30 03:01:01'),
(304, 137, 1, '2025-12-30 02:45:54', 1, NULL, NULL, NULL, '2025-12-30 03:00:48'),
(314, 139, 3, '2025-12-30 03:49:19', 1, NULL, NULL, NULL, '2025-12-30 03:51:20'),
(315, 139, 8, '2025-12-30 03:49:21', 1, NULL, NULL, NULL, '2025-12-30 03:51:20'),
(317, 140, 8, '2025-12-30 04:27:08', 1, NULL, NULL, NULL, '2025-12-30 04:29:21'),
(318, 140, 3, '2025-12-30 04:27:49', 1, NULL, NULL, NULL, '2025-12-30 04:29:27'),
(322, 141, 3, '2025-12-30 05:04:48', 1, NULL, NULL, NULL, '2025-12-30 05:12:10'),
(323, 141, 8, '2025-12-30 05:05:46', 1, NULL, NULL, NULL, '2025-12-30 05:12:19'),
(330, 143, 8, '2025-12-30 06:16:29', 1, NULL, NULL, NULL, '2025-12-30 06:18:33'),
(331, 143, 3, '2025-12-30 06:16:37', 1, NULL, NULL, NULL, '2025-12-30 06:18:17'),
(333, 145, 8, '2025-12-30 06:28:33', 1, NULL, NULL, NULL, '2025-12-30 06:30:54'),
(334, 145, 3, '2025-12-30 06:28:35', 1, NULL, NULL, NULL, '2025-12-30 06:30:50'),
(336, 146, 3, '2025-12-30 06:55:49', 1, NULL, NULL, NULL, '2025-12-30 06:59:42'),
(337, 146, 8, '2025-12-30 06:55:51', 1, NULL, NULL, NULL, '2025-12-30 06:59:42'),
(339, 147, 8, '2025-12-30 07:14:29', 1, NULL, NULL, NULL, '2025-12-30 07:18:58'),
(340, 147, 3, '2025-12-30 07:14:35', 1, NULL, NULL, NULL, '2025-12-30 07:18:58'),
(342, 148, 1, '2025-12-30 07:29:31', 1, NULL, NULL, NULL, '2025-12-30 07:42:04'),
(343, 148, 8, '2025-12-30 07:31:59', 1, NULL, NULL, NULL, '2025-12-30 07:42:11'),
(346, 149, 3, '2025-12-30 07:55:57', 1, NULL, NULL, NULL, '2025-12-30 07:59:44'),
(347, 149, 1, '2025-12-30 07:57:10', 1, NULL, NULL, NULL, '2025-12-30 07:59:41'),
(349, 150, 1, '2025-12-30 08:13:49', 1, NULL, NULL, NULL, '2025-12-30 08:17:33'),
(350, 150, 3, '2025-12-30 08:14:45', 1, NULL, NULL, NULL, '2025-12-30 08:17:33'),
(351, 151, 1, '2025-12-30 08:25:51', 1, NULL, NULL, NULL, '2025-12-30 08:27:16'),
(352, 151, 3, '2025-12-30 08:26:28', 1, NULL, NULL, NULL, '2025-12-30 08:27:17'),
(353, 152, 1, '2025-12-30 08:36:52', 1, NULL, NULL, NULL, '2025-12-30 08:39:30'),
(354, 152, 3, '2025-12-30 08:37:43', 1, NULL, NULL, NULL, '2025-12-30 08:39:30'),
(357, 153, 3, '2025-12-30 08:46:19', 1, NULL, NULL, NULL, '2025-12-30 08:50:01'),
(358, 153, 1, '2025-12-30 08:46:34', 1, NULL, NULL, NULL, '2025-12-30 08:50:04'),
(361, 154, 3, '2025-12-30 08:51:57', 1, NULL, NULL, NULL, '2025-12-30 08:52:23'),
(362, 154, 1, '2025-12-30 08:52:06', 1, NULL, NULL, NULL, '2025-12-30 08:56:15'),
(366, 155, 1, '2025-12-30 10:17:12', 1, NULL, NULL, NULL, '2025-12-30 11:16:36'),
(367, 155, 3, '2025-12-30 10:17:34', 1, NULL, NULL, NULL, '2025-12-30 11:16:35'),
(378, 156, 3, '2025-12-30 11:18:38', 1, NULL, NULL, NULL, '2025-12-30 11:19:04'),
(379, 156, 1, '2025-12-30 11:18:48', 1, NULL, NULL, NULL, '2025-12-30 11:19:02'),
(395, 163, 1, '2025-12-30 15:39:46', 1, NULL, NULL, NULL, '2025-12-30 15:44:36'),
(396, 163, 3, '2025-12-30 15:39:58', 1, NULL, NULL, NULL, '2025-12-30 15:44:24'),
(399, 164, 1, '2025-12-30 15:54:51', 1, NULL, NULL, NULL, '2025-12-30 15:57:12'),
(400, 164, 3, '2025-12-30 15:55:12', 1, NULL, NULL, NULL, '2025-12-30 15:57:03');

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
  `spectator_code` varchar(20) DEFAULT NULL COMMENT 'Unique code for spectators to join'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Lobby rooms with spectator mode support - hosts can enable spectators to watch matches';

--
-- Dumping data for table `duel_lobby_rooms`
--

INSERT INTO `duel_lobby_rooms` (`lobby_id`, `room_code`, `room_name`, `description`, `host_user_id`, `max_players`, `difficulty`, `is_private`, `password`, `problem_id`, `status`, `created_at`, `started_at`, `ended_at`, `allow_spectators`, `host_spectator_mode`, `spectator_code`) VALUES
(76, 'V915PF', 'dwa', 'dwa', 1, 2, 'Easy', 0, '', 3, 'in_progress', '2025-12-21 01:10:42', '2025-12-21 01:11:08', NULL, 0, 0, NULL),
(97, 'OM4HGX', 'dwda', '', 1, 45, 'Easy', 0, '', 21, 'in_progress', '2025-12-21 22:04:29', '2025-12-21 22:05:36', NULL, 1, 0, 'ZXD0FV'),
(103, 'C5UA7T', 'dwa', '', 1, 45, 'Easy', 0, '', 42, 'in_progress', '2025-12-22 07:52:57', '2025-12-22 07:54:43', NULL, 1, 1, 'F9YAH5'),
(104, '3REHS6', 'dwa', '', 1, 45, 'Easy', 1, '0TN899', 41, 'in_progress', '2025-12-22 08:21:47', '2025-12-22 08:27:27', NULL, 1, 1, '930619'),
(105, '8ISH2V', 'dawd', '', 8, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-22 09:33:02', '2025-12-22 09:36:47', NULL, 1, 1, 'MI6FS6'),
(106, 'PART1K', 'dwa', '', 1, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-22 09:50:00', '2025-12-22 09:52:00', NULL, 1, 1, 'T3BORQ'),
(107, 'F26LVN', 'dwad', '', 1, 45, 'Easy', 0, '', 42, 'in_progress', '2025-12-22 10:20:02', '2025-12-22 10:21:30', NULL, 1, 1, 'BII6ND'),
(108, 'ARTT7H', 'dwad', '', 1, 45, 'Easy', 1, '7R52QE', 40, 'in_progress', '2025-12-27 12:49:33', '2025-12-27 12:54:52', NULL, 1, 1, '9R9VV3'),
(109, 'U52MVN', 'dawd', '', 1, 45, 'Easy', 1, 'V7OIZ0', 39, 'in_progress', '2025-12-27 13:26:49', '2025-12-27 13:29:02', NULL, 1, 1, 'KJWH1D'),
(110, 'XIYDEN', 'fefefwdaw', '', 8, 45, 'Easy', 1, 'KG2USC', 38, 'in_progress', '2025-12-27 13:43:14', '2025-12-27 13:43:59', NULL, 1, 1, 'TDT4TY'),
(111, 'EYFL9P', 'adwdawd', '', 3, 45, 'Easy', 1, 'YBR381', 36, 'in_progress', '2025-12-27 14:07:05', '2025-12-27 14:09:37', NULL, 0, 0, NULL),
(112, 'SIKC00', 'dawdad', '', 3, 45, 'Easy', 1, 'T8G5VY', 33, 'in_progress', '2025-12-27 14:20:08', '2025-12-27 14:22:58', NULL, 1, 1, 'BBGH2Y'),
(114, 'TFN7IG', 'dwada', '', 1, 45, 'Easy', 1, 'H9TBDA', 35, 'in_progress', '2025-12-27 15:07:44', '2025-12-27 15:09:37', NULL, 1, 1, 'C5ORSY'),
(115, 'DSX7ZA', 'dwad', '', 1, 45, 'Easy', 1, 'DA7UIX', 2, 'in_progress', '2025-12-27 20:39:17', '2025-12-27 20:43:24', NULL, 1, 1, 'Z7LPBE'),
(117, 'B9JK25', 'dwadwa', '', 1, 45, 'Easy', 1, 'SE4FI7', 5, 'in_progress', '2025-12-27 21:37:38', '2025-12-27 21:42:44', NULL, 1, 1, '848JH9'),
(118, '4EW526', 'dawda', '', 1, 45, 'Easy', 1, 'UXCUNB', 4, 'in_progress', '2025-12-27 22:02:18', '2025-12-27 22:05:33', NULL, 0, 0, NULL),
(119, 'MG5V1M', 'csdfcs', '', 1, 45, 'Easy', 1, '0P4XNO', 18, 'in_progress', '2025-12-27 22:26:59', '2025-12-27 22:28:05', NULL, 1, 1, 'H5P57J'),
(121, '09L44C', 'fesfsef', '', 1, 45, 'Easy', 1, 'FZAZMM', 18, 'in_progress', '2025-12-27 23:51:14', '2025-12-28 00:05:53', NULL, 1, 0, '2FS1MY'),
(122, 'YTQQKZ', 'dawd', '', 1, 45, 'Easy', 1, 'OK2VZK', 40, 'in_progress', '2025-12-28 01:23:30', '2025-12-28 01:28:56', NULL, 1, 1, 'SSY1M5'),
(123, 'GLY763', 'dwadaw', '', 1, 45, 'Easy', 1, '28CUS7', 3, 'in_progress', '2025-12-29 02:45:52', '2025-12-29 02:49:07', NULL, 1, 1, 'DVJGLI'),
(126, 'VY7UOK', 'dwaa', '', 8, 45, 'Easy', 1, 'ST8I90', 42, 'in_progress', '2025-12-29 06:03:06', '2025-12-29 06:12:54', NULL, 0, 0, NULL),
(127, 'ZVW3KR', 'dwad', '', 1, 45, 'Easy', 1, '7YDB8C', 41, 'in_progress', '2025-12-29 07:03:40', '2025-12-29 07:05:30', NULL, 1, 1, 'J9ND66'),
(128, 'EIXPEH', 'dawd', '', 3, 45, 'Easy', 1, '4BNDXI', 5, 'in_progress', '2025-12-29 07:45:51', '2025-12-29 07:48:57', NULL, 0, 1, NULL),
(132, 'BI2TAT', 'awds', '', 1, 45, 'Easy', 1, 'RFDDHS', 34, 'in_progress', '2025-12-30 00:43:24', '2025-12-30 00:58:56', NULL, 1, 0, '0PIDBT'),
(133, 'WU3AD0', 'daw', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 01:58:47', '2025-12-30 02:04:02', NULL, 1, 1, '6Y8U8I'),
(134, 'VDZZPY', 'awdf', '', 1, 45, 'Easy', 0, '', 3, 'in_progress', '2025-12-30 02:20:45', '2025-12-30 02:22:05', NULL, 1, 1, 'EEI49N'),
(136, 'HVV3T4', 'daww', '', 1, 45, 'Easy', 1, '6O2PCG', 37, 'in_progress', '2025-12-30 02:33:53', '2025-12-30 02:40:02', NULL, 1, 1, '256ANT'),
(137, 'VQ463G', 'faw', '', 8, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-30 02:45:20', '2025-12-30 03:00:39', NULL, 1, 1, 'X0OPJW'),
(139, '2H3HC6', 'adwwas', '', 1, 45, 'Easy', 0, '', 5, 'in_progress', '2025-12-30 03:48:42', '2025-12-30 03:50:45', NULL, 1, 1, '9CY3ZN'),
(140, 'BSH9QO', 'dawaw', '', 1, 45, 'Easy', 0, '', 37, 'in_progress', '2025-12-30 04:26:28', '2025-12-30 04:29:01', NULL, 1, 1, 'DC7TAS'),
(141, '79BBSJ', 'dwadwa', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 05:04:17', '2025-12-30 05:07:43', NULL, 1, 1, 'S77W1C'),
(143, 'DRAB19', 'dawd', '', 1, 45, 'Easy', 0, '', 42, 'in_progress', '2025-12-30 06:16:16', '2025-12-30 06:18:11', NULL, 1, 1, 'PDJDLH'),
(145, 'YB8KZ0', 'dawd', '', 1, 45, 'Easy', 0, '', 21, 'in_progress', '2025-12-30 06:27:55', '2025-12-30 06:30:28', NULL, 1, 1, 'R54XQH'),
(146, 'JAWE7K', 'dwad', '', 1, 45, 'Easy', 0, '', 39, 'in_progress', '2025-12-30 06:55:14', '2025-12-30 06:59:27', NULL, 1, 1, 'BFTPTP'),
(147, 'OD7M28', 'dwa', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 07:13:54', '2025-12-30 07:18:34', NULL, 1, 1, 'LIONAV'),
(148, '3IS5U0', 'dwa', '', 3, 45, 'Easy', 0, '', 5, 'in_progress', '2025-12-30 07:29:09', '2025-12-30 07:41:57', NULL, 1, 1, 'Y5YSQI'),
(149, 'JDYB8N', 'daww', '', 8, 45, 'Easy', 0, '', 34, 'in_progress', '2025-12-30 07:55:26', '2025-12-30 07:59:36', NULL, 1, 1, '8C086M'),
(150, 'FOITB1', 'fsefa', '', 8, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-30 08:13:08', '2025-12-30 08:17:32', NULL, 1, 1, 'LEYYB6'),
(151, '9LJ4LJ', 'dawd', '', 3, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 08:25:48', '2025-12-30 08:27:11', NULL, 0, 0, NULL),
(152, 'PRSCTW', 'dawd', '', 1, 45, 'Easy', 0, '', 37, 'in_progress', '2025-12-30 08:36:49', '2025-12-30 08:39:25', NULL, 0, 0, NULL),
(153, '249HQN', 'adwa', '', 1, 45, 'Easy', 0, '', 5, 'in_progress', '2025-12-30 08:46:12', '2025-12-30 08:49:57', NULL, 0, 0, NULL),
(154, '6FKQ25', 'dawd', '', 3, 45, 'Easy', 0, '', 37, 'in_progress', '2025-12-30 08:51:51', '2025-12-30 08:52:21', NULL, 0, 0, NULL),
(155, '88PWNY', 'DADW', '', 1, 45, 'Easy', 0, '', 18, 'in_progress', '2025-12-30 10:17:08', '2025-12-30 11:14:20', NULL, 0, 0, NULL),
(156, '3MDKB5', 'dwa', '', 3, 45, 'Easy', 0, '', 34, 'in_progress', '2025-12-30 11:18:35', '2025-12-30 11:18:58', NULL, 0, 0, NULL),
(163, '8H1UX7', 'dawdw', '', 1, 45, 'Easy', 0, '', 35, 'in_progress', '2025-12-30 15:39:40', '2025-12-30 15:40:31', NULL, 0, 0, NULL),
(164, 'BL652U', 'dwad', '', 1, 45, 'Easy', 0, '', 40, 'in_progress', '2025-12-30 15:54:47', '2025-12-30 15:55:18', NULL, 0, 0, NULL);

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
  `xp_awarded` tinyint(1) DEFAULT 0 COMMENT 'Whether XP has been awarded'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `duel_matches`
--

INSERT INTO `duel_matches` (`match_id`, `player1_id`, `player2_id`, `winner_id`, `match_date`, `status`, `match_duration_minutes`, `match_started_at`, `match_end_time`, `dp_awarded`, `xp_awarded`) VALUES
(1, 1, 3, NULL, '2025-12-06 06:01:31', 'in_progress', 30, NULL, NULL, 0, 0),
(2, 3, 1, NULL, '2025-12-07 01:32:04', 'in_progress', 30, NULL, NULL, 0, 0),
(4, 1, 3, NULL, '2025-12-11 19:52:51', 'in_progress', 30, NULL, NULL, 0, 0),
(5, 1, 3, NULL, '2025-12-11 21:45:34', 'in_progress', 30, NULL, NULL, 0, 0),
(6, 1, 3, NULL, '2025-12-11 21:55:22', 'in_progress', 30, NULL, NULL, 0, 0),
(7, 3, 1, NULL, '2025-12-11 22:12:08', 'in_progress', 30, NULL, NULL, 0, 0),
(8, 1, 3, NULL, '2025-12-12 00:35:29', 'in_progress', 30, NULL, NULL, 0, 0),
(9, 1, 3, NULL, '2025-12-12 00:52:39', 'in_progress', 30, NULL, NULL, 0, 0),
(10, 3, 1, NULL, '2025-12-12 01:37:07', 'in_progress', 30, NULL, NULL, 0, 0),
(11, 1, 3, NULL, '2025-12-12 01:47:05', 'in_progress', 30, NULL, NULL, 0, 0),
(12, 1, 3, NULL, '2025-12-12 02:18:53', 'in_progress', 30, NULL, NULL, 0, 0),
(13, 3, 1, NULL, '2025-12-12 02:32:07', 'in_progress', 30, NULL, NULL, 0, 0),
(14, 3, 1, NULL, '2025-12-12 06:46:18', 'in_progress', 30, NULL, NULL, 0, 0),
(15, 1, 3, NULL, '2025-12-12 09:25:52', 'in_progress', 30, NULL, NULL, 0, 0),
(16, 1, 3, NULL, '2025-12-12 09:28:10', 'in_progress', 30, NULL, NULL, 0, 0),
(17, 1, 3, NULL, '2025-12-12 09:36:25', 'in_progress', 30, NULL, NULL, 0, 0),
(18, 1, 3, NULL, '2025-12-12 09:45:03', 'in_progress', 30, NULL, NULL, 0, 0),
(19, 1, 3, NULL, '2025-12-12 09:58:51', 'in_progress', 30, NULL, NULL, 0, 0),
(20, 1, 3, NULL, '2025-12-12 10:14:35', 'in_progress', 30, NULL, NULL, 0, 0),
(21, 1, 3, NULL, '2025-12-12 10:35:18', 'in_progress', 30, NULL, NULL, 0, 0),
(22, 3, 1, NULL, '2025-12-12 10:48:07', 'in_progress', 30, NULL, NULL, 0, 0),
(23, 3, 1, NULL, '2025-12-12 10:59:47', 'in_progress', 30, NULL, NULL, 0, 0),
(24, 3, 1, NULL, '2025-12-12 11:12:52', 'in_progress', 30, NULL, NULL, 0, 0),
(25, 3, 1, NULL, '2025-12-12 11:46:03', 'in_progress', 30, NULL, NULL, 0, 0),
(26, 3, 1, NULL, '2025-12-12 12:52:48', 'in_progress', 30, NULL, NULL, 0, 0),
(27, 3, 1, NULL, '2025-12-12 13:42:11', 'in_progress', 30, NULL, NULL, 0, 0),
(28, 1, 3, NULL, '2025-12-12 13:55:57', 'in_progress', 30, NULL, NULL, 0, 0),
(29, 3, 1, NULL, '2025-12-12 13:59:57', 'in_progress', 30, NULL, NULL, 0, 0),
(30, 3, 1, NULL, '2025-12-12 14:08:52', 'in_progress', 30, NULL, NULL, 0, 0),
(31, 3, 1, NULL, '2025-12-12 14:17:03', 'in_progress', 30, NULL, NULL, 0, 0),
(32, 1, 3, NULL, '2025-12-12 14:36:50', 'in_progress', 30, NULL, NULL, 0, 0),
(33, 1, 3, NULL, '2025-12-12 14:37:17', 'in_progress', 30, NULL, NULL, 0, 0),
(34, 1, 3, NULL, '2025-12-12 14:37:49', 'in_progress', 30, NULL, NULL, 0, 0),
(35, 1, 3, NULL, '2025-12-13 06:27:59', 'in_progress', 30, NULL, NULL, 0, 0),
(36, 1, 3, NULL, '2025-12-13 06:30:47', 'in_progress', 30, NULL, NULL, 0, 0),
(37, 3, 1, NULL, '2025-12-13 06:36:18', 'in_progress', 30, NULL, NULL, 0, 0),
(38, 1, 3, NULL, '2025-12-13 06:39:24', 'in_progress', 30, NULL, NULL, 0, 0),
(39, 1, 3, NULL, '2025-12-13 06:42:03', 'in_progress', 30, NULL, NULL, 0, 0),
(40, 1, 3, NULL, '2025-12-13 06:45:19', 'in_progress', 30, NULL, NULL, 0, 0),
(41, 1, 3, NULL, '2025-12-13 06:51:14', 'in_progress', 30, NULL, NULL, 0, 0),
(42, 1, 3, NULL, '2025-12-13 06:56:39', 'in_progress', 30, NULL, NULL, 0, 0),
(43, 1, 3, NULL, '2025-12-13 07:01:58', 'in_progress', 30, NULL, NULL, 0, 0),
(44, 1, 3, NULL, '2025-12-13 07:08:46', 'in_progress', 30, NULL, NULL, 0, 0),
(45, 1, 3, NULL, '2025-12-13 07:16:28', 'in_progress', 30, NULL, NULL, 0, 0),
(46, 3, 1, NULL, '2025-12-13 07:30:12', 'in_progress', 30, NULL, NULL, 0, 0),
(47, 1, 3, NULL, '2025-12-13 07:43:57', 'in_progress', 30, NULL, NULL, 0, 0),
(48, 1, 3, NULL, '2025-12-13 07:54:40', 'in_progress', 30, NULL, NULL, 0, 0),
(49, 3, 1, NULL, '2025-12-13 07:56:30', 'in_progress', 30, NULL, NULL, 0, 0),
(50, 1, 3, NULL, '2025-12-13 08:00:05', 'in_progress', 30, NULL, NULL, 0, 0),
(51, 1, 3, NULL, '2025-12-13 08:14:18', 'in_progress', 30, NULL, NULL, 0, 0),
(52, 1, 3, NULL, '2025-12-13 08:20:32', 'in_progress', 30, NULL, NULL, 0, 0),
(53, 1, 3, NULL, '2025-12-13 08:27:52', 'in_progress', 30, NULL, NULL, 0, 0),
(54, 1, 3, NULL, '2025-12-13 08:31:06', 'in_progress', 30, NULL, NULL, 0, 0),
(55, 3, 1, NULL, '2025-12-13 08:32:44', 'in_progress', 30, NULL, NULL, 0, 0),
(56, 3, 1, NULL, '2025-12-13 08:34:10', 'in_progress', 30, NULL, NULL, 0, 0),
(57, 3, 1, NULL, '2025-12-13 08:36:07', 'in_progress', 30, NULL, NULL, 0, 0),
(58, 1, 3, NULL, '2025-12-13 08:37:48', 'in_progress', 30, NULL, NULL, 0, 0),
(59, 1, 3, NULL, '2025-12-13 08:39:32', 'in_progress', 30, NULL, NULL, 0, 0),
(60, 1, 3, NULL, '2025-12-13 09:23:33', 'in_progress', 30, NULL, NULL, 0, 0),
(61, 1, 3, NULL, '2025-12-13 10:24:03', 'in_progress', 30, NULL, NULL, 0, 0),
(62, 3, 1, NULL, '2025-12-13 10:31:51', 'in_progress', 30, NULL, NULL, 0, 0),
(63, 3, 1, NULL, '2025-12-13 10:41:10', 'in_progress', 30, NULL, NULL, 0, 0),
(64, 1, 3, NULL, '2025-12-13 10:42:40', 'in_progress', 30, NULL, NULL, 0, 0),
(65, 3, 1, NULL, '2025-12-13 10:44:25', 'in_progress', 30, NULL, NULL, 0, 0),
(66, 1, 3, NULL, '2025-12-13 10:50:13', 'in_progress', 30, NULL, NULL, 0, 0),
(67, 1, 3, NULL, '2025-12-13 10:58:07', 'in_progress', 30, NULL, NULL, 0, 0),
(68, 1, 3, NULL, '2025-12-13 11:15:14', 'in_progress', 30, NULL, NULL, 0, 0),
(69, 1, 3, NULL, '2025-12-13 11:22:54', 'in_progress', 30, NULL, NULL, 0, 0),
(70, 3, 1, NULL, '2025-12-13 11:29:26', 'in_progress', 30, NULL, NULL, 0, 0),
(71, 1, 3, NULL, '2025-12-13 11:30:29', 'in_progress', 30, NULL, NULL, 0, 0),
(72, 1, 3, NULL, '2025-12-13 11:32:37', 'in_progress', 30, NULL, NULL, 0, 0),
(73, 1, 3, NULL, '2025-12-13 11:36:07', 'in_progress', 30, NULL, NULL, 0, 0),
(74, 3, 1, NULL, '2025-12-13 11:38:31', 'in_progress', 30, NULL, NULL, 0, 0),
(75, 1, 3, NULL, '2025-12-13 11:39:45', 'in_progress', 30, NULL, NULL, 0, 0),
(76, 1, 3, NULL, '2025-12-13 11:43:20', 'in_progress', 30, NULL, NULL, 0, 0),
(77, 1, 3, NULL, '2025-12-13 11:48:20', 'in_progress', 30, NULL, NULL, 0, 0),
(78, 3, 1, NULL, '2025-12-13 11:50:18', 'in_progress', 30, NULL, NULL, 0, 0),
(79, 3, 1, NULL, '2025-12-13 11:51:19', 'in_progress', 30, NULL, NULL, 0, 0),
(80, 3, 1, NULL, '2025-12-13 11:55:49', 'in_progress', 30, NULL, NULL, 0, 0),
(81, 1, 3, NULL, '2025-12-13 12:18:18', 'in_progress', 30, NULL, NULL, 0, 0),
(82, 3, 1, 1, '2025-12-13 19:45:15', 'completed', 30, NULL, NULL, 0, 0),
(83, 3, 1, 3, '2025-12-13 19:53:39', 'completed', 30, NULL, NULL, 0, 0),
(84, 1, 3, 3, '2025-12-13 19:56:35', 'completed', 30, NULL, NULL, 0, 0),
(85, 3, 1, NULL, '2025-12-13 20:08:49', 'in_progress', 30, NULL, NULL, 0, 0),
(86, 1, 3, 3, '2025-12-13 20:16:12', 'completed', 30, NULL, NULL, 0, 0),
(87, 1, 3, 1, '2025-12-13 20:31:25', 'completed', 30, NULL, NULL, 0, 0),
(88, 1, 3, 3, '2025-12-13 20:43:22', 'completed', 30, NULL, NULL, 0, 0),
(89, 1, 3, 1, '2025-12-13 20:49:07', 'completed', 30, NULL, NULL, 0, 0),
(90, 3, 1, 1, '2025-12-13 21:02:53', 'completed', 30, NULL, NULL, 0, 0),
(91, 1, 3, 1, '2025-12-13 21:38:51', 'completed', 30, NULL, NULL, 0, 0),
(92, 1, 3, 3, '2025-12-13 22:48:17', 'completed', 30, NULL, NULL, 0, 0),
(93, 1, 8, 1, '2025-12-13 22:57:41', 'completed', 30, NULL, NULL, 0, 0),
(94, 1, 8, 8, '2025-12-13 23:15:50', 'completed', 30, NULL, NULL, 0, 0),
(95, 1, 8, 8, '2025-12-13 23:32:01', 'completed', 30, NULL, NULL, 0, 0),
(96, 8, 1, 8, '2025-12-13 23:38:26', 'completed', 30, NULL, NULL, 0, 0),
(97, 8, 1, 1, '2025-12-13 23:43:58', 'completed', 30, NULL, NULL, 0, 0),
(98, 1, 8, 1, '2025-12-13 23:46:16', 'completed', 30, NULL, NULL, 0, 0),
(99, 1, 8, 1, '2025-12-13 23:51:15', 'completed', 30, NULL, NULL, 0, 0),
(100, 1, 8, NULL, '2025-12-14 00:10:55', 'completed', 30, NULL, NULL, 0, 0),
(101, 1, 8, 1, '2025-12-14 00:12:17', 'completed', 30, NULL, NULL, 0, 0),
(102, 8, 1, 8, '2025-12-14 00:15:38', 'completed', 30, NULL, NULL, 0, 0),
(103, 1, 8, 1, '2025-12-14 00:23:36', 'completed', 30, NULL, NULL, 0, 0),
(104, 1, 8, 1, '2025-12-14 00:33:27', 'completed', 30, NULL, NULL, 0, 0),
(105, 8, 1, 1, '2025-12-14 00:44:59', 'completed', 30, NULL, NULL, 0, 0),
(106, 1, 3, NULL, '2025-12-14 01:18:44', 'in_progress', 30, NULL, NULL, 0, 0),
(107, 1, 3, 1, '2025-12-14 01:24:54', 'completed', 30, NULL, NULL, 0, 0),
(108, 1, 3, 3, '2025-12-14 01:28:07', 'completed', 30, NULL, NULL, 0, 0),
(109, 3, 1, NULL, '2025-12-14 02:01:39', '', 30, NULL, NULL, 0, 0),
(110, 1, 3, NULL, '2025-12-14 02:18:48', 'in_progress', 30, NULL, NULL, 0, 0),
(111, 1, 3, NULL, '2025-12-14 02:28:02', '', 30, NULL, NULL, 0, 0),
(112, 3, 1, NULL, '2025-12-14 02:34:36', 'abandoned', 30, NULL, NULL, 0, 0),
(113, 3, 1, NULL, '2025-12-14 05:57:16', 'abandoned', 30, NULL, NULL, 0, 0),
(114, 3, 1, NULL, '2025-12-14 06:09:16', 'abandoned', 30, NULL, NULL, 0, 0),
(115, 1, 3, NULL, '2025-12-14 06:20:57', 'abandoned', 30, NULL, NULL, 0, 0),
(116, 1, 3, NULL, '2025-12-14 06:21:51', 'abandoned', 30, NULL, NULL, 0, 0),
(117, 1, 3, 3, '2025-12-14 06:34:45', 'abandoned', 30, NULL, NULL, 0, 0),
(118, 3, 1, 1, '2025-12-14 06:35:54', 'abandoned', 30, NULL, NULL, 0, 0),
(119, 1, 3, 1, '2025-12-14 06:38:32', 'abandoned', 30, NULL, NULL, 0, 0),
(120, 1, 3, NULL, '2025-12-14 06:40:36', 'abandoned', 30, NULL, NULL, 0, 0),
(121, 1, 3, NULL, '2025-12-14 07:10:01', 'abandoned', 30, NULL, NULL, 0, 0),
(122, 3, 1, NULL, '2025-12-14 07:13:09', 'abandoned', 30, NULL, NULL, 0, 0),
(123, 1, 3, 3, '2025-12-14 07:16:41', 'abandoned', 30, NULL, NULL, 0, 0),
(124, 1, 3, NULL, '2025-12-14 07:56:04', 'abandoned', 30, NULL, NULL, 0, 0),
(125, 1, 3, NULL, '2025-12-14 08:08:47', 'in_progress', 30, NULL, NULL, 0, 0),
(126, 1, 3, NULL, '2025-12-14 08:18:15', 'abandoned', 30, NULL, NULL, 0, 0),
(127, 1, 3, NULL, '2025-12-14 08:21:36', 'abandoned', 30, NULL, NULL, 0, 0),
(128, 1, 3, NULL, '2025-12-14 08:28:07', 'abandoned', 30, NULL, NULL, 0, 0),
(129, 3, 1, NULL, '2025-12-14 08:38:55', 'in_progress', 30, NULL, NULL, 0, 0),
(130, 1, 3, 3, '2025-12-14 08:48:11', 'abandoned', 30, NULL, NULL, 0, 0),
(131, 1, 3, 3, '2025-12-14 09:02:39', 'completed', 30, NULL, NULL, 0, 0),
(132, 1, 3, NULL, '2025-12-14 09:22:39', 'abandoned', 30, NULL, NULL, 0, 0),
(133, 1, 3, NULL, '2025-12-14 09:27:13', 'abandoned', 30, NULL, NULL, 0, 0),
(134, 1, 3, NULL, '2025-12-14 09:32:56', 'abandoned', 30, NULL, NULL, 0, 0),
(135, 1, 3, NULL, '2025-12-14 09:39:12', 'abandoned', 30, NULL, NULL, 0, 0),
(136, 1, 3, 3, '2025-12-14 09:44:54', 'completed', 30, NULL, NULL, 0, 0),
(137, 3, 1, NULL, '2025-12-14 10:40:02', 'in_progress', 30, NULL, NULL, 0, 0),
(138, 1, 3, 3, '2025-12-14 10:51:43', 'completed', 30, NULL, NULL, 0, 0),
(139, 3, 1, 3, '2025-12-14 10:54:03', 'completed', 30, NULL, NULL, 0, 0),
(140, 1, 3, 3, '2025-12-14 11:01:41', 'completed', 30, NULL, NULL, 0, 0),
(141, 1, 3, NULL, '2025-12-14 11:03:04', 'abandoned', 30, NULL, NULL, 0, 0),
(142, 1, 3, NULL, '2025-12-14 11:23:49', 'abandoned', 30, NULL, NULL, 0, 0),
(143, 1, 3, 1, '2025-12-14 11:25:58', 'completed', 30, NULL, NULL, 0, 0),
(144, 1, 3, NULL, '2025-12-14 11:30:03', 'abandoned', 30, NULL, NULL, 0, 0),
(145, 1, 3, NULL, '2025-12-14 11:38:15', 'abandoned', 30, NULL, NULL, 0, 0),
(146, 3, 1, NULL, '2025-12-14 11:40:51', 'abandoned', 30, NULL, NULL, 0, 0),
(147, 1, 3, NULL, '2025-12-14 11:43:48', 'abandoned', 30, NULL, NULL, 0, 0),
(148, 3, 1, NULL, '2025-12-14 11:52:49', 'in_progress', 30, NULL, NULL, 0, 0),
(149, 1, 3, 3, '2025-12-14 11:56:44', 'completed', 30, NULL, NULL, 0, 0),
(150, 3, 1, NULL, '2025-12-14 12:04:44', 'abandoned', 30, NULL, NULL, 0, 0),
(151, 1, 3, NULL, '2025-12-14 12:09:31', 'abandoned', 30, NULL, NULL, 0, 0),
(152, 1, 3, NULL, '2025-12-14 12:17:38', 'abandoned', 30, NULL, NULL, 0, 0),
(153, 1, 3, NULL, '2025-12-14 12:19:55', 'abandoned', 30, NULL, NULL, 0, 0),
(154, 1, 3, 1, '2025-12-14 12:20:44', 'completed', 30, NULL, NULL, 0, 0),
(155, 3, 1, 3, '2025-12-14 13:47:06', 'completed', 30, NULL, NULL, 0, 0),
(156, 3, 1, 1, '2025-12-14 13:55:59', 'completed', 30, NULL, NULL, 0, 0),
(157, 1, 3, 3, '2025-12-14 19:24:21', 'completed', 30, NULL, NULL, 0, 0),
(158, 1, 3, NULL, '2025-12-14 19:26:23', 'abandoned', 30, NULL, NULL, 0, 0),
(159, 1, 3, 3, '2025-12-14 19:27:30', 'completed', 30, NULL, NULL, 0, 0),
(160, 3, 1, 3, '2025-12-14 20:16:31', 'completed', 30, NULL, NULL, 0, 0),
(161, 3, 1, NULL, '2025-12-14 22:16:57', 'abandoned', 30, NULL, NULL, 0, 0),
(162, 1, 3, NULL, '2025-12-14 22:29:26', 'abandoned', 30, NULL, NULL, 0, 0),
(163, 1, 3, NULL, '2025-12-14 22:38:49', 'abandoned', 30, NULL, NULL, 0, 0),
(164, 1, 3, NULL, '2025-12-14 22:44:06', 'abandoned', 30, NULL, NULL, 0, 0),
(165, 1, 3, 3, '2025-12-14 22:45:05', 'completed', 30, NULL, NULL, 0, 0),
(166, 1, 3, 3, '2025-12-15 12:29:03', 'completed', 30, NULL, NULL, 0, 0),
(167, 3, 1, 1, '2025-12-15 12:30:36', 'completed', 30, NULL, NULL, 0, 0),
(168, 3, 1, 1, '2025-12-15 12:34:45', 'completed', 30, NULL, NULL, 0, 0),
(169, 3, 1, 1, '2025-12-15 12:40:20', 'completed', 30, NULL, NULL, 0, 0),
(170, 1, 3, 1, '2025-12-15 12:49:37', 'completed', 30, NULL, NULL, 0, 0),
(171, 1, 3, NULL, '2025-12-15 12:51:15', 'in_progress', 30, NULL, NULL, 0, 0),
(172, 3, 1, 1, '2025-12-15 13:02:54', 'completed', 30, NULL, NULL, 0, 0),
(173, 1, 3, NULL, '2025-12-15 13:04:54', 'abandoned', 30, NULL, NULL, 0, 0),
(174, 3, 1, NULL, '2025-12-15 13:12:33', 'abandoned', 30, NULL, NULL, 0, 0),
(175, 3, 1, NULL, '2025-12-15 13:24:10', 'abandoned', 30, NULL, NULL, 0, 0),
(176, 3, 1, NULL, '2025-12-15 13:27:49', 'abandoned', 30, NULL, NULL, 0, 0),
(177, 1, 3, NULL, '2025-12-15 13:31:46', 'abandoned', 30, NULL, NULL, 0, 0),
(178, 3, 1, 1, '2025-12-15 13:43:54', 'completed', 30, NULL, NULL, 0, 0),
(179, 1, 3, NULL, '2025-12-15 13:45:59', 'abandoned', 30, NULL, NULL, 0, 0),
(180, 1, 3, NULL, '2025-12-15 13:54:22', 'abandoned', 30, NULL, NULL, 0, 0),
(181, 1, 3, NULL, '2025-12-15 14:04:14', 'abandoned', 30, NULL, NULL, 0, 0),
(182, 1, 3, 3, '2025-12-15 14:19:09', 'completed', 30, NULL, NULL, 0, 0),
(183, 1, 3, 1, '2025-12-15 14:22:59', 'completed', 30, NULL, NULL, 0, 0),
(184, 3, 1, 1, '2025-12-15 14:25:09', 'completed', 30, NULL, NULL, 0, 0),
(185, 1, 3, 3, '2025-12-15 14:26:30', 'completed', 30, NULL, NULL, 0, 0),
(186, 1, 3, NULL, '2025-12-15 14:28:40', 'in_progress', 30, NULL, NULL, 0, 0),
(187, 1, 3, NULL, '2025-12-15 14:46:39', 'abandoned', 30, NULL, NULL, 0, 0),
(188, 1, 3, NULL, '2025-12-15 15:14:20', 'abandoned', 30, NULL, NULL, 0, 0),
(189, 1, 3, 3, '2025-12-15 15:43:34', 'completed', 30, NULL, NULL, 0, 0),
(190, 3, 1, 3, '2025-12-15 15:48:00', 'completed', 30, NULL, NULL, 0, 0),
(191, 1, 3, NULL, '2025-12-15 15:51:43', 'in_progress', 30, NULL, NULL, 0, 0),
(192, 1, 3, NULL, '2025-12-15 16:53:07', 'in_progress', 30, NULL, NULL, 0, 0),
(193, 1, 3, NULL, '2025-12-15 16:55:25', 'in_progress', 30, NULL, NULL, 0, 0),
(194, 1, 3, 1, '2025-12-15 17:03:33', 'completed', 30, NULL, NULL, 0, 0),
(195, 3, 1, NULL, '2025-12-15 17:05:40', 'in_progress', 30, NULL, NULL, 0, 0),
(196, 1, 3, 1, '2025-12-15 17:20:53', 'completed', 30, NULL, NULL, 0, 0),
(197, 1, 3, NULL, '2025-12-15 17:22:16', 'abandoned', 30, NULL, NULL, 0, 0),
(198, 3, 1, 1, '2025-12-15 18:37:46', 'completed', 30, NULL, NULL, 0, 0),
(199, 1, 3, NULL, '2025-12-15 18:42:07', 'abandoned', 30, NULL, NULL, 0, 0),
(200, 1, 3, NULL, '2025-12-15 19:07:06', 'in_progress', 30, NULL, NULL, 0, 0),
(201, 1, 3, NULL, '2025-12-15 19:21:40', 'abandoned', 30, NULL, NULL, 0, 0),
(202, 3, 1, NULL, '2025-12-15 19:24:45', 'abandoned', 30, NULL, NULL, 0, 0),
(203, 3, 1, 3, '2025-12-15 19:37:20', 'completed', 30, NULL, NULL, 0, 0),
(204, 1, 3, NULL, '2025-12-15 19:39:16', 'abandoned', 30, NULL, NULL, 0, 0),
(205, 1, 3, NULL, '2025-12-15 20:31:15', 'in_progress', 30, NULL, NULL, 0, 0),
(206, 1, 3, NULL, '2025-12-15 20:49:25', 'abandoned', 30, NULL, NULL, 0, 0),
(207, 1, 3, NULL, '2025-12-15 20:52:22', 'abandoned', 30, NULL, NULL, 0, 0),
(208, 1, 3, NULL, '2025-12-15 21:46:13', 'abandoned', 30, NULL, NULL, 0, 0),
(209, 1, 3, NULL, '2025-12-15 21:53:10', 'abandoned', 30, NULL, NULL, 0, 0),
(210, 1, 3, NULL, '2025-12-15 22:03:07', 'in_progress', 30, NULL, NULL, 0, 0),
(211, 1, 3, 1, '2025-12-15 22:06:53', 'completed', 30, NULL, NULL, 0, 0),
(212, 3, 1, NULL, '2025-12-15 22:09:14', 'abandoned', 30, NULL, NULL, 0, 0),
(213, 1, 3, NULL, '2025-12-15 22:30:29', 'abandoned', 30, NULL, NULL, 0, 0),
(214, 3, 1, NULL, '2025-12-15 22:41:39', 'abandoned', 30, NULL, NULL, 0, 0),
(215, 3, 1, NULL, '2025-12-15 22:50:49', 'abandoned', 30, NULL, NULL, 0, 0),
(216, 3, 1, NULL, '2025-12-15 22:53:42', 'abandoned', 30, NULL, NULL, 0, 0),
(217, 1, 3, NULL, '2025-12-15 22:58:22', 'abandoned', 30, NULL, NULL, 0, 0),
(218, 1, 3, NULL, '2025-12-15 23:03:57', 'abandoned', 30, NULL, NULL, 0, 0),
(219, 1, 3, NULL, '2025-12-15 23:09:03', 'abandoned', 30, NULL, NULL, 0, 0),
(220, 8, 1, NULL, '2025-12-15 23:11:22', 'abandoned', 30, NULL, NULL, 0, 0),
(221, 1, 8, NULL, '2025-12-15 23:15:47', 'abandoned', 30, NULL, NULL, 0, 0),
(222, 1, 8, NULL, '2025-12-15 23:16:54', 'abandoned', 30, NULL, NULL, 0, 0),
(223, 1, 8, NULL, '2025-12-15 23:28:26', 'abandoned', 30, NULL, NULL, 0, 0),
(224, 1, 8, NULL, '2025-12-15 23:35:33', 'abandoned', 30, NULL, NULL, 0, 0),
(225, 8, 1, NULL, '2025-12-15 23:37:19', 'abandoned', 30, NULL, NULL, 0, 0),
(226, 1, 8, NULL, '2025-12-16 00:30:42', 'abandoned', 30, NULL, NULL, 0, 0),
(227, 1, 8, NULL, '2025-12-16 00:34:46', 'abandoned', 30, NULL, NULL, 0, 0),
(228, 1, 8, NULL, '2025-12-16 00:43:44', 'abandoned', 30, NULL, NULL, 0, 0),
(229, 1, 8, NULL, '2025-12-16 00:51:09', 'abandoned', 30, NULL, NULL, 0, 0),
(230, 1, 8, NULL, '2025-12-16 00:56:51', 'abandoned', 30, NULL, NULL, 0, 0),
(231, 1, 8, NULL, '2025-12-16 01:11:32', 'abandoned', 30, NULL, NULL, 0, 0),
(232, 1, 8, NULL, '2025-12-16 01:15:15', 'abandoned', 30, NULL, NULL, 0, 0),
(233, 1, 8, NULL, '2025-12-16 01:18:32', 'abandoned', 30, NULL, NULL, 0, 0),
(234, 1, 8, NULL, '2025-12-16 01:40:13', 'abandoned', 30, NULL, NULL, 0, 0),
(235, 1, 8, NULL, '2025-12-16 01:42:36', 'abandoned', 30, NULL, NULL, 0, 0),
(236, 3, 1, 3, '2025-12-16 05:54:24', 'completed', 30, NULL, NULL, 0, 0),
(237, 1, 3, 3, '2025-12-16 05:58:51', 'completed', 30, NULL, NULL, 0, 0),
(238, 1, 3, NULL, '2025-12-16 06:10:58', 'abandoned', 30, NULL, NULL, 0, 0),
(239, 1, 3, NULL, '2025-12-16 06:14:08', 'abandoned', 30, NULL, NULL, 0, 0),
(240, 1, 3, NULL, '2025-12-16 06:19:06', 'abandoned', 30, NULL, NULL, 0, 0),
(241, 3, 1, 1, '2025-12-21 00:21:02', 'completed', 30, NULL, NULL, 0, 0),
(242, 3, 1, NULL, '2025-12-21 23:26:50', 'in_progress', 30, '2025-12-22 07:26:50', '2025-12-22 07:56:50', 0, 0),
(243, 3, 1, NULL, '2025-12-21 23:42:49', 'in_progress', 30, '2025-12-22 07:42:49', '2025-12-22 08:12:49', 0, 0),
(244, 1, 3, 1, '2025-12-21 23:43:56', 'completed', 30, '2025-12-22 07:43:56', '2025-12-22 08:13:56', 0, 0),
(245, 3, 1, 1, '2025-12-22 00:49:51', 'completed', 15, '2025-12-22 08:49:51', '2025-12-22 09:04:51', 0, 0),
(246, 3, 1, 3, '2025-12-22 00:55:41', 'completed', 15, '2025-12-22 08:55:41', '2025-12-22 09:10:41', 0, 0),
(247, 3, 1, 3, '2025-12-22 01:05:05', 'completed', 15, '2025-12-22 09:05:05', '2025-12-22 09:20:05', 0, 0),
(248, 1, 3, 1, '2025-12-22 01:19:46', 'completed', 15, '2025-12-22 09:19:46', '2025-12-22 09:34:46', 0, 0),
(249, 1, 3, 1, '2025-12-22 05:05:45', 'completed', 15, '2025-12-22 13:05:45', '2025-12-22 13:20:45', 0, 0),
(250, 3, 1, 1, '2025-12-22 05:23:22', 'completed', 30, '2025-12-22 13:23:22', '2025-12-22 13:53:22', 0, 0),
(251, 3, 1, 1, '2025-12-22 05:35:51', 'completed', 15, '2025-12-22 13:35:51', '2025-12-22 13:50:51', 0, 0),
(252, 1, 3, 3, '2025-12-22 06:03:07', 'completed', 30, '2025-12-22 14:03:07', '2025-12-22 14:33:07', 0, 0),
(253, 3, 1, NULL, '2025-12-22 06:05:43', 'abandoned', 15, '2025-12-22 14:05:43', '2025-12-22 14:20:43', 0, 0),
(254, 1, 8, 8, '2025-12-30 08:07:37', 'completed', 15, '2025-12-30 16:07:37', '2025-12-30 16:22:37', 0, 0),
(255, 1, 8, 8, '2025-12-30 08:10:00', 'completed', 15, '2025-12-30 16:10:00', '2025-12-30 16:25:00', 0, 0);

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
(36, NULL, 3, 'import ast\narr = ast.literal_eval(input().strip())\ncount = sum(1 for num in arr if num < 0)\nprint(count)', '', '2025-12-30 15:56:28');

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
(1, 'create_own_blog', 'Create, edit, delete own blogs'),
(2, 'delete_any_blog', 'Delete own and others blogs'),
(3, 'edit_any_blog', 'Edit blogs created by others'),
(4, 'create_own_event', 'Create, edit, delete own events'),
(5, 'delete_any_event', 'Delete own and others events'),
(6, 'edit_any_event', 'Edit events created by others'),
(7, 'manage_event_participants', 'Invite and manage event participants'),
(8, 'create_own_problem', 'Create, edit, delete own question set'),
(9, 'delete_any_problem', 'Delete own and others question set'),
(10, 'edit_other_level_problem', 'Edit problems of other level privileges'),
(11, 'approve_problem', 'Approve or deny problems below your privilege level'),
(12, 'approve_blog', 'Approve or deny blogs below your privilege level'),
(13, 'approve_event', 'Approve or deny events below your privilege level'),
(14, 'ban_users', 'Ban users'),
(15, 'manage_roles', 'Manage user roles'),
(16, 'set_faculty', 'Assign user role to faculty'),
(17, 'set_admin', 'Assign user role to admin');

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
(1, 'Find First Duplicate', 'Medium', 1, 64, 'Given an array of integers, find and return the first element that appears more than once. If no duplicate exists, return -1.\n\nExample:\nInput: [2, 1, 3, 5, 3, 2]\nOutput: 3\n\nInput: [1, 2, 3, 4]\nOutput: -1'),
(2, 'Two Sum', 'Medium', 1, 64, 'Given an array of integers and a target sum, return the indices of two numbers that add up to the target.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\n\nExplanation: nums[0] + nums[1] = 2 + 7 = 9'),
(3, 'Valid Parentheses', 'Medium', 1, 64, 'Given a string containing only parentheses (), brackets [], and braces {}, determine if the input string is valid. A string is valid if all opening brackets have matching closing brackets in the correct order.\n\nExample:\nInput: \"()[]{}\"\nOutput: true\n\nInput: \"(]\"\nOutput: false'),
(4, 'Longest Substring Without Repeating', 'Medium', 2, 128, 'Find length of longest substring without repeating characters'),
(5, 'Merge K Sorted Lists', 'Hard', 2, 128, 'Merge k sorted linked lists into one sorted list'),
(18, 'Sum of Even Numbers', 'Medium', 1, 64, 'Given an array of integers, calculate and return the sum of all even numbers in the array.\n\nExample:\nInput: [1, 2, 3, 4, 5, 6]\nOutput: 12\n\nExplanation: 2 + 4 + 6 = 12'),
(21, 'Count Positive Numbers', 'Medium', 1, 64, 'Given an array of integers, count and return how many numbers are positive (greater than 0).\n\nExample:\nInput: [1, -2, 3, 0, 5, -7]\nOutput: 3\n\nExplanation: 1, 3, and 5 are positive'),
(33, 'Sum of Positive Numbers (+)', 'Medium', 1, 64, 'Given an array of integers, calculate the sum of all positive numbers (greater than zero) in the array.\n\nExample:\nInput: [1, -2, 3, -4, 5]\nOutput: 9\n\nExplanation: 1 + 3 + 5 = 9'),
(34, 'Count Numbers Greater Than 10', 'Medium', 1, 64, 'Given an array of integers, count how many numbers are strictly greater than 10.\n\nExample:\nInput: [5, 12, 8, 20, 11]\nOutput: 3\n\nExplanation: 12, 20, and 11 are greater than 10'),
(35, 'Sum of Two Numbers', 'Easy', 1, 64, 'Given two integers, return their sum.\n\nExample:\nInput: 5 3\nOutput: 8\n\nInput: -10 20\nOutput: 10'),
(36, 'Find Maximum in Array', 'Easy', 1, 64, 'Given an array of integers, find and return the largest number.\n\nExample:\nInput: [3, 7, 2, 9, 1]\nOutput: 9\n\nInput: [-5, -2, -10, -1]\nOutput: -1'),
(37, 'Count Vowels in String', 'Easy', 1, 64, 'Given a string, count the number of vowels (a, e, i, o, u) in it. Count both uppercase and lowercase vowels.\n\nExample:\nInput: \"Hello World\"\nOutput: 3\n\nExplanation: e, o, o are vowels'),
(38, 'Reverse a String', 'Easy', 1, 64, 'Given a string, return the reversed string.\n\nExample:\nInput: \"hello\"\nOutput: \"olleh\"\n\nInput: \"Python\"\nOutput: \"nohtyP\"'),
(39, 'Is Number Even', 'Easy', 1, 64, 'Given an integer, return \"true\" if it is even, \"false\" if it is odd.\n\nExample:\nInput: 4\nOutput: true\n\nInput: 7\nOutput: false'),
(40, 'Count Negative Numbers', 'Easy', 1, 64, 'Given an array of integers, count how many numbers are negative (less than 0).\n\nExample:\nInput: [1, -2, 3, -4, -5, 6]\nOutput: 3\n\nExplanation: -2, -4, -5 are negative'),
(41, 'Multiply Array Elements', 'Easy', 1, 64, 'Given an array of integers, return the product of all elements.\n\nExample:\nInput: [2, 3, 4]\nOutput: 24\n\nExplanation: 2 * 3 * 4 = 24'),
(42, 'Find Minimum in Array', 'Easy', 1, 64, 'Given an array of integers, find and return the smallest number.\n\nExample:\nInput: [3, 7, 2, 9, 1]\nOutput: 1\n\nInput: [-5, -2, -10, -1]\nOutput: -10');

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
(1, 1),
(2, 1),
(3, 2),
(18, 1),
(33, 1),
(33, 3),
(34, 1),
(34, 3),
(35, 3),
(36, 1),
(37, 2),
(38, 2),
(39, 3),
(40, 1),
(40, 3),
(41, 1),
(41, 3),
(42, 1);

-- --------------------------------------------------------

--
-- Table structure for table `problem_submissions`
--

CREATE TABLE `problem_submissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `problem_submissions`
--

INSERT INTO `problem_submissions` (`id`, `user_id`, `problem_id`) VALUES
(6, 3, 3),
(4, 4, 1),
(5, 7, 2);

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
(6, 'Dynamic Programming', 'Problems requiring DP solutions and optimization', '2025-12-12 21:15:40');

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

--
-- Dumping data for table `problem_user_progression`
--

INSERT INTO `problem_user_progression` (`id`, `problem_id`, `user_id`, `progress`) VALUES
(1, 1, 4, 'complete'),
(2, 2, 4, 'unfinished'),
(3, 4, 4, 'complete'),
(4, 5, 4, 'unfinished');

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
(1, 4, 'Cant Prove it', NULL, 'asset/profile/avatar_4_1765288736673.jpg'),
(2, 5, 'Its Who?', NULL, 'asset/profile/avatar_5_1765092617803.jpg'),
(4, 7, 'James Sunderland', NULL, 'asset/profile/avatar_7_1765289722252.jpg');

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
(32, 3, 16);

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
(51, 8, 149, '2025-12-30 07:59:43', NULL);

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
(4, 3, 3, 3772, 40, 0, 0, '2025-12-16 06:20:30'),
(5, 8, 1, 670, 50, 0, 0, '2025-12-16 01:43:30');

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
(170, 39, 1, 1, '4', 'true', 0),
(171, 39, 2, 1, '7', 'false', 0),
(172, 39, 3, 1, '0', 'true', 0),
(173, 39, 4, 0, '2', 'true', 10),
(174, 39, 5, 0, '1', 'false', 10),
(175, 39, 6, 0, '100', 'true', 10),
(176, 39, 7, 0, '999', 'false', 10),
(177, 39, 8, 0, '-2', 'true', 10),
(178, 39, 9, 0, '-5', 'false', 10),
(179, 39, 10, 0, '1000', 'true', 10),
(180, 39, 11, 0, '1001', 'false', 10),
(181, 39, 12, 0, '-100', 'true', 10),
(182, 39, 13, 0, '50', 'true', 10),
(222, 39, 1, 1, '4', 'true', 0),
(223, 39, 2, 1, '7', 'false', 0),
(224, 39, 3, 1, '0', 'true', 0),
(225, 39, 4, 0, '100', 'true', 0),
(226, 39, 5, 0, '99', 'false', 0),
(227, 39, 6, 0, '-2', 'true', 0),
(228, 39, 7, 0, '-5', 'false', 0),
(229, 39, 8, 0, '1000', 'true', 0),
(230, 39, 9, 0, '1001', 'false', 0),
(231, 39, 10, 0, '2', 'true', 0),
(232, 39, 11, 0, '3', 'false', 0),
(233, 39, 12, 0, '8888', 'true', 0),
(234, 39, 13, 0, '7777', 'false', 0),
(235, 1, 0, 1, '[2, 1, 3, 5, 3, 2]', '3', 0),
(236, 1, 0, 1, '[1, 2, 3, 4]', '-1', 0),
(237, 1, 0, 1, '[5, 5, 1, 2]', '5', 0),
(238, 1, 0, 0, '[1]', '-1', 0),
(239, 1, 0, 0, '[10, 10]', '10', 0),
(240, 1, 0, 0, '[7, 2, 3, 7, 1]', '7', 0),
(241, 1, 0, 0, '[9, 8, 7, 6, 5, 4, 3, 2, 1, 2]', '2', 0),
(242, 1, 0, 0, '[100, 200, 300, 100]', '100', 0),
(243, 1, 0, 0, '[15, 16, 15, 17]', '15', 0),
(244, 1, 0, 0, '[11, 22, 33, 44, 55]', '-1', 0),
(245, 1, 0, 0, '[-1, -2, -1]', '-1', 0),
(246, 1, 0, 0, '[0, 1, 0, 2]', '0', 0),
(247, 1, 0, 0, '[99, 98, 97, 99, 96]', '99', 0),
(248, 2, 0, 1, '[2,7,11,15]\n9', '[0, 1]', 0),
(249, 2, 0, 1, '[3,2,4]\n6', '[1, 2]', 0),
(250, 2, 0, 1, '[3,3]\n6', '[0, 1]', 0),
(251, 2, 0, 0, '[1,2,3,4,5]\n9', '[3, 4]', 0),
(252, 2, 0, 0, '[10,20,30,40]\n70', '[2, 3]', 0),
(253, 2, 0, 0, '[5,5,5,5]\n10', '[0, 1]', 0),
(254, 2, 0, 0, '[100,200,300]\n500', '[1, 2]', 0),
(255, 2, 0, 0, '[-1,-2,-3,-4]\n-7', '[2, 3]', 0),
(256, 2, 0, 0, '[0,4,3,0]\n0', '[0, 3]', 0),
(257, 2, 0, 0, '[1,2]\n3', '[0, 1]', 0),
(258, 2, 0, 0, '[15,11,7,2]\n9', '[2, 3]', 0),
(259, 2, 0, 0, '[8,8]\n16', '[0, 1]', 0),
(260, 2, 0, 0, '[99,1,2,3,4]\n100', '[0, 1]', 0),
(261, 3, 0, 1, '()', 'true', 0),
(262, 3, 0, 1, '()[]{}', 'true', 0),
(263, 3, 0, 1, '(]', 'false', 0),
(264, 3, 0, 0, '{[]}', 'true', 0),
(265, 3, 0, 0, '([)]', 'false', 0),
(266, 3, 0, 0, '((', 'false', 0),
(267, 3, 0, 0, '))', 'false', 0),
(268, 3, 0, 0, '(())', 'true', 0),
(269, 3, 0, 0, '{[()]}', 'true', 0),
(270, 3, 0, 0, '{[(])}', 'false', 0),
(271, 3, 0, 0, '', 'true', 0),
(272, 3, 0, 0, '((()))', 'true', 0),
(273, 3, 0, 0, '{{{', 'false', 0),
(274, 4, 0, 1, 'abcabcbb', '3', 0),
(275, 4, 0, 1, 'bbbbb', '1', 0),
(276, 4, 0, 1, 'pwwkew', '3', 0),
(277, 4, 0, 0, '', '0', 0),
(278, 4, 0, 0, 'a', '1', 0),
(279, 4, 0, 0, 'abcdefg', '7', 0),
(280, 4, 0, 0, 'aab', '2', 0),
(281, 4, 0, 0, 'dvdf', '3', 0),
(282, 4, 0, 0, 'abba', '2', 0),
(283, 4, 0, 0, 'tmmzuxt', '5', 0),
(284, 4, 0, 0, 'abcabcbb', '3', 0),
(285, 4, 0, 0, 'pwwkew', '3', 0),
(286, 4, 0, 0, 'aaaaaaa', '1', 0),
(287, 5, 0, 1, '[[1,4,5],[1,3,4],[2,6]]', '[1, 1, 2, 3, 4, 4, 5, 6]', 0),
(288, 5, 0, 1, '[]', '[]', 0),
(289, 5, 0, 1, '[[]]', '[]', 0),
(290, 5, 0, 0, '[[1],[2],[3]]', '[1, 2, 3]', 0),
(291, 5, 0, 0, '[[1,2,3],[4,5,6]]', '[1, 2, 3, 4, 5, 6]', 0),
(292, 5, 0, 0, '[[5],[1],[3],[2,4]]', '[1, 2, 3, 4, 5]', 0),
(293, 5, 0, 0, '[[10,20],[15,25],[5,35]]', '[5, 10, 15, 20, 25, 35]', 0),
(294, 5, 0, 0, '[[1,1,1],[2,2,2]]', '[1, 1, 1, 2, 2, 2]', 0),
(295, 5, 0, 0, '[[7]]', '[7]', 0),
(296, 5, 0, 0, '[[9,9],[8,8],[7,7]]', '[7, 7, 8, 8, 9, 9]', 0),
(297, 5, 0, 0, '[[100,200,300]]', '[100, 200, 300]', 0),
(298, 5, 0, 0, '[[-1,-2],[-3,-4]]', '[-4, -3, -2, -1]', 0),
(299, 5, 0, 0, '[[0],[0],[0]]', '[0, 0, 0]', 0),
(300, 18, 0, 1, '[1, 2, 3, 4, 5, 6]', '12', 0),
(301, 18, 0, 1, '[1, 3, 5, 7]', '0', 0),
(302, 18, 0, 1, '[2, 4, 6, 8]', '20', 0),
(303, 18, 0, 0, '[10, 15, 20, 25]', '30', 0),
(304, 18, 0, 0, '[0, 1, 2, 3]', '2', 0),
(305, 18, 0, 0, '[]', '0', 0),
(306, 18, 0, 0, '[100]', '100', 0),
(307, 18, 0, 0, '[99]', '0', 0),
(308, 18, 0, 0, '[-2, -4, -6]', '-12', 0),
(309, 18, 0, 0, '[1000, 2000, 3000]', '6000', 0),
(310, 18, 0, 0, '[11, 22, 33, 44]', '66', 0),
(311, 18, 0, 0, '[7, 14, 21, 28]', '42', 0),
(312, 18, 0, 0, '[2, 2, 2, 2]', '8', 0),
(313, 21, 0, 1, '[1, -2, 3, 0, 5, -7]', '3', 0),
(314, 21, 0, 1, '[-1, -2, -3]', '0', 0),
(315, 21, 0, 1, '[1, 2, 3, 4, 5]', '5', 0),
(316, 21, 0, 0, '[]', '0', 0),
(317, 21, 0, 0, '[0]', '0', 0),
(318, 21, 0, 0, '[100]', '1', 0),
(319, 21, 0, 0, '[-100]', '0', 0),
(320, 21, 0, 0, '[1, 0, -1, 2, 0, -2]', '2', 0),
(321, 21, 0, 0, '[10, 20, 30, 40, 50]', '5', 0),
(322, 21, 0, 0, '[-5, -10, -15, -20]', '0', 0),
(323, 21, 0, 0, '[999, -999, 1, -1]', '2', 0),
(324, 21, 0, 0, '[5, 5, 5, 5]', '4', 0),
(325, 21, 0, 0, '[-1, 0, 1]', '1', 0),
(326, 33, 0, 1, '[1, -2, 3, -4, 5]', '9', 0),
(327, 33, 0, 1, '[-1, -2, -3]', '0', 0),
(328, 33, 0, 1, '[10, 20, 30]', '60', 0),
(329, 33, 0, 0, '[]', '0', 0),
(330, 33, 0, 0, '[0]', '0', 0),
(331, 33, 0, 0, '[100]', '100', 0),
(332, 33, 0, 0, '[-100]', '0', 0),
(333, 33, 0, 0, '[1, 0, -1, 2, 0, -2, 3]', '6', 0),
(334, 33, 0, 0, '[5, -5, 10, -10]', '15', 0),
(335, 33, 0, 0, '[-999, -888, -777]', '0', 0),
(336, 33, 0, 0, '[7, 7, 7, 7]', '28', 0),
(337, 33, 0, 0, '[1000, 2000, 3000]', '6000', 0),
(338, 33, 0, 0, '[-50, 50, -25, 25]', '75', 0),
(339, 34, 0, 1, '[5, 12, 8, 20, 11]', '3', 0),
(340, 34, 0, 1, '[1, 2, 3, 4, 5]', '0', 0),
(341, 34, 0, 1, '[15, 25, 35]', '3', 0),
(342, 34, 0, 0, '[]', '0', 0),
(343, 34, 0, 0, '[10]', '0', 0),
(344, 34, 0, 0, '[11]', '1', 0),
(345, 34, 0, 0, '[10, 10, 10]', '0', 0),
(346, 34, 0, 0, '[11, 12, 13]', '3', 0),
(347, 34, 0, 0, '[100, 200, 300]', '3', 0),
(348, 34, 0, 0, '[9, 10, 11]', '1', 0),
(349, 34, 0, 0, '[-100, 0, 100]', '1', 0),
(350, 34, 0, 0, '[10, 11, 10, 11]', '2', 0),
(351, 34, 0, 0, '[1000]', '1', 0),
(352, 35, 0, 1, '5 3', '8', 0),
(353, 35, 0, 1, '10 20', '30', 0),
(354, 35, 0, 1, '0 0', '0', 0),
(355, 35, 0, 0, '100 200', '300', 0),
(356, 35, 0, 0, '-5 5', '0', 0),
(357, 35, 0, 0, '-10 -20', '-30', 0),
(358, 35, 0, 0, '999 1', '1000', 0),
(359, 35, 0, 0, '0 100', '100', 0),
(360, 35, 0, 0, '50 50', '100', 0),
(361, 35, 0, 0, '1 1', '2', 0),
(362, 35, 0, 0, '-1 -1', '-2', 0),
(363, 35, 0, 0, '7 8', '15', 0),
(364, 35, 0, 0, '1000 2000', '3000', 0),
(365, 36, 0, 1, '[3, 7, 2, 9, 1]', '9', 0),
(366, 36, 0, 1, '[1]', '1', 0),
(367, 36, 0, 1, '[5, 5, 5]', '5', 0),
(368, 36, 0, 0, '[100, 200, 300]', '300', 0),
(369, 36, 0, 0, '[-1, -2, -3]', '-1', 0),
(370, 36, 0, 0, '[0, 0, 0]', '0', 0),
(371, 36, 0, 0, '[10, 20, 15, 25, 30]', '30', 0),
(372, 36, 0, 0, '[999]', '999', 0),
(373, 36, 0, 0, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', '10', 0),
(374, 36, 0, 0, '[-100, 0, 100]', '100', 0),
(375, 36, 0, 0, '[50, 49, 48, 47]', '50', 0),
(376, 36, 0, 0, '[7, 7, 7, 8, 7]', '8', 0),
(377, 36, 0, 0, '[1000, 1000, 1000]', '1000', 0),
(378, 37, 0, 1, 'Hello World', '3', 0),
(379, 37, 0, 1, 'aeiou', '5', 0),
(380, 37, 0, 1, 'xyz', '0', 0),
(381, 37, 0, 0, '', '0', 0),
(382, 37, 0, 0, 'AEIOU', '5', 0),
(383, 37, 0, 0, 'bcdfg', '0', 0),
(384, 37, 0, 0, 'Programming', '3', 0),
(385, 37, 0, 0, 'a', '1', 0),
(386, 37, 0, 0, 'z', '0', 0),
(387, 37, 0, 0, 'AEIOUaeiou', '10', 0),
(388, 37, 0, 0, 'The Quick Brown Fox', '5', 0),
(389, 37, 0, 0, '12345', '0', 0),
(390, 37, 0, 0, 'Beautiful', '5', 0),
(391, 38, 0, 1, 'hello', 'olleh', 0),
(392, 38, 0, 1, 'world', 'dlrow', 0),
(393, 38, 0, 1, 'a', 'a', 0),
(394, 38, 0, 0, '', '', 0),
(395, 38, 0, 0, 'ab', 'ba', 0),
(396, 38, 0, 0, '12345', '54321', 0),
(397, 38, 0, 0, 'racecar', 'racecar', 0),
(398, 38, 0, 0, 'Python', 'nohtyP', 0),
(399, 38, 0, 0, 'Hello World', 'dlroW olleH', 0),
(400, 38, 0, 0, 'abcdefghij', 'jihgfedcba', 0),
(401, 38, 0, 0, '!@#$%', '%$#@!', 0),
(402, 38, 0, 0, 'AaBbCc', 'cCbBaA', 0),
(403, 38, 0, 0, '123', '321', 0),
(404, 40, 0, 1, '[1, -2, 3, -4, -5, 6]', '3', 0),
(405, 40, 0, 1, '[1, 2, 3]', '0', 0),
(406, 40, 0, 1, '[-1, -2, -3]', '3', 0),
(407, 40, 0, 0, '[]', '0', 0),
(408, 40, 0, 0, '[0]', '0', 0),
(409, 40, 0, 0, '[-1]', '1', 0),
(410, 40, 0, 0, '[0, -1, 0, -2]', '2', 0),
(411, 40, 0, 0, '[100, -100, 200, -200]', '2', 0),
(412, 40, 0, 0, '[-5, -10, -15, -20]', '4', 0),
(413, 40, 0, 0, '[10, 20, 30]', '0', 0),
(414, 40, 0, 0, '[-999]', '1', 0),
(415, 40, 0, 0, '[1, 0, -1, 2, 0, -2]', '2', 0),
(416, 40, 0, 0, '[-7, -7, -7]', '3', 0),
(417, 41, 0, 1, '[2, 3, 4]', '24', 0),
(418, 41, 0, 1, '[1, 2, 3]', '6', 0),
(419, 41, 0, 1, '[5, 5]', '25', 0),
(420, 41, 0, 0, '[1]', '1', 0),
(421, 41, 0, 0, '[10, 10, 10]', '1000', 0),
(422, 41, 0, 0, '[2, 2, 2, 2]', '16', 0),
(423, 41, 0, 0, '[0, 5, 10]', '0', 0),
(424, 41, 0, 0, '[-2, 3]', '-6', 0),
(425, 41, 0, 0, '[-1, -1, -1]', '-1', 0),
(426, 41, 0, 0, '[7, 8, 9]', '504', 0),
(427, 41, 0, 0, '[100]', '100', 0),
(428, 41, 0, 0, '[1, 1, 1, 1, 1]', '1', 0),
(429, 41, 0, 0, '[5, 0, 5]', '0', 0),
(430, 42, 0, 1, '[3, 7, 2, 9, 1]', '1', 0),
(431, 42, 0, 1, '[5]', '5', 0),
(432, 42, 0, 1, '[10, 10, 10]', '10', 0),
(433, 42, 0, 0, '[100, 200, 50]', '50', 0),
(434, 42, 0, 0, '[-1, -2, -3]', '-3', 0),
(435, 42, 0, 0, '[0, 0, 0]', '0', 0),
(436, 42, 0, 0, '[999, 1, 888]', '1', 0),
(437, 42, 0, 0, '[10, 20, 5, 30]', '5', 0),
(438, 42, 0, 0, '[-100]', '-100', 0),
(439, 42, 0, 0, '[5, 4, 3, 2, 1]', '1', 0),
(440, 42, 0, 0, '[100, 99, 98]', '98', 0),
(441, 42, 0, 0, '[7, 7, 7, 6]', '6', 0),
(442, 42, 0, 0, '[50, 50, 49]', '49', 0);

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
(4, 'Cant Prove it', 'isjudyonthatcargobox@gmail.com', '$2b$10$xJ17Nr9ugsokNAAgAt/EV.pOoQluRbKiqxWlltAPsWGtSiQp4i/DC', 'user', '2025-12-07 07:26:45'),
(5, 'Its Who?', 'something@gmail.com', '$2b$10$OlpXSLSFHH.sQlnzxAcMiudT3oYmomTlcdA15zB365MdOxlB4hLeW', 'user', '2025-12-07 07:29:36'),
(7, 'James Sunderland', 'jamessunderland@gmail.com', '$2b$10$qifq9TH01e7JD5598Y7O6uPWn9qZ7UEpipNde2sC8uo8t2fMtJTRe', 'user', '2025-12-09 14:13:48'),
(8, 'user2', 'user2@gmail.com', '$2b$10$5RIzQNb8mTRmhj.7PJn7lOHU1WS9gBYjaA5JNioQPc73D/GSwDbHa', 'user', '2025-12-13 22:43:06');

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
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `token` (`token`(255)),
  ADD KEY `idx_token_expires` (`token`(255),`expires_at`);

--
-- Indexes for table `approvals`
--
ALTER TABLE `approvals`
  ADD PRIMARY KEY (`approval_id`),
  ADD KEY `approvals_ibfk_1` (`content_item_id`),
  ADD KEY `approvals_ibfk_2` (`requested_by`),
  ADD KEY `approvals_ibfk_3` (`approved_by`);

--
-- Indexes for table `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`blog_id`),
  ADD KEY `blogs_ibfk_1` (`author_id`);

--
-- Indexes for table `blog_likes`
--
ALTER TABLE `blog_likes`
  ADD PRIMARY KEY (`like_id`),
  ADD UNIQUE KEY `blog_id` (`blog_id`,`user_id`),
  ADD KEY `blog_likes_ibfk_2` (`user_id`);

--
-- Indexes for table `content_blogs`
--
ALTER TABLE `content_blogs`
  ADD PRIMARY KEY (`content_item_id`),
  ADD KEY `content_blogs_ibfk_2` (`blog_id`);

--
-- Indexes for table `content_events`
--
ALTER TABLE `content_events`
  ADD PRIMARY KEY (`content_item_id`),
  ADD KEY `content_events_ibfk_2` (`event_id`);

--
-- Indexes for table `content_items`
--
ALTER TABLE `content_items`
  ADD PRIMARY KEY (`content_item_id`);

--
-- Indexes for table `content_problems`
--
ALTER TABLE `content_problems`
  ADD PRIMARY KEY (`content_item_id`),
  ADD KEY `content_problems_ibfk_2` (`problem_id`);

--
-- Indexes for table `duel_lobby_messages`
--
ALTER TABLE `duel_lobby_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `lobby_id` (`lobby_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `duel_lobby_players`
--
ALTER TABLE `duel_lobby_players`
  ADD PRIMARY KEY (`lobby_player_id`),
  ADD UNIQUE KEY `unique_lobby_user` (`lobby_id`,`user_id`),
  ADD KEY `lobby_id` (`lobby_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_lobby_score` (`lobby_id`,`score`,`completion_time`);

--
-- Indexes for table `duel_lobby_rooms`
--
ALTER TABLE `duel_lobby_rooms`
  ADD PRIMARY KEY (`lobby_id`),
  ADD UNIQUE KEY `room_code` (`room_code`),
  ADD KEY `host_user_id` (`host_user_id`),
  ADD KEY `status` (`status`),
  ADD KEY `problem_id` (`problem_id`),
  ADD KEY `idx_spectator_code` (`spectator_code`);

--
-- Indexes for table `duel_matches`
--
ALTER TABLE `duel_matches`
  ADD PRIMARY KEY (`match_id`),
  ADD KEY `player1_id` (`player1_id`),
  ADD KEY `player2_id` (`player2_id`),
  ADD KEY `winner_id` (`winner_id`),
  ADD KEY `idx_match_timing` (`match_end_time`,`status`),
  ADD KEY `idx_dp_awarded` (`dp_awarded`,`status`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `events_ibfk_1` (`host_id`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`participant_id`),
  ADD UNIQUE KEY `event_id` (`event_id`,`user_id`),
  ADD KEY `event_participants_ibfk_2` (`user_id`);

--
-- Indexes for table `event_schedule`
--
ALTER TABLE `event_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `event_schedule_ibfk_1` (`event_id`);

--
-- Indexes for table `match_records`
--
ALTER TABLE `match_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `match_id` (`match_id`),
  ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `pending_abandonment_notifications`
--
ALTER TABLE `pending_abandonment_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user_pending` (`user_id`,`shown_at`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `permission_name` (`permission_name`);

--
-- Indexes for table `problems`
--
ALTER TABLE `problems`
  ADD PRIMARY KEY (`problem_id`);

--
-- Indexes for table `problems_have_topics`
--
ALTER TABLE `problems_have_topics`
  ADD PRIMARY KEY (`problem_id`,`topic_id`),
  ADD KEY `idx_problems_have_topics_topic_id` (`topic_id`),
  ADD KEY `idx_problems_have_topics_problem_id` (`problem_id`);

--
-- Indexes for table `problem_submissions`
--
ALTER TABLE `problem_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`,`problem_id`),
  ADD KEY `fk_ps_problemid_to_problems_problemid` (`problem_id`);

--
-- Indexes for table `problem_topics`
--
ALTER TABLE `problem_topics`
  ADD PRIMARY KEY (`topic_id`),
  ADD UNIQUE KEY `topic_name` (`topic_name`),
  ADD KEY `idx_problem_topics_topic_name` (`topic_name`);

--
-- Indexes for table `problem_user_progression`
--
ALTER TABLE `problem_user_progression`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_problemuserprogression_problemid_to_problem_problemid` (`problem_id`),
  ADD KEY `fk_problemuserprogression_userid_to_user_userid` (`user_id`);

--
-- Indexes for table `problem_user_progression_draft_code`
--
ALTER TABLE `problem_user_progression_draft_code`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pupdc_pupid_to_pup_pupid` (`problem_user_progress_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD KEY `role_permissions_ibfk_1` (`role_id`),
  ADD KEY `role_permissions_ibfk_2` (`permission_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `rooms_ibfk_1` (`event_id`),
  ADD KEY `rooms_ibfk_2` (`host_id`);

--
-- Indexes for table `room_activity_log`
--
ALTER TABLE `room_activity_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `room_activity_log_ibfk_1` (`room_id`),
  ADD KEY `room_activity_log_ibfk_2` (`user_id`);

--
-- Indexes for table `room_players`
--
ALTER TABLE `room_players`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_id` (`room_id`,`user_id`),
  ADD KEY `room_players_ibfk_2` (`user_id`);

--
-- Indexes for table `solution_submissions`
--
ALTER TABLE `solution_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `problem_id` (`problem_id`);

--
-- Indexes for table `spectator_sessions`
--
ALTER TABLE `spectator_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_spectator_lobby` (`lobby_id`),
  ADD KEY `idx_spectator_user` (`spectator_user_id`);

--
-- Indexes for table `statistic`
--
ALTER TABLE `statistic`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_is_banned` (`is_banned`);

--
-- Indexes for table `system_backup`
--
ALTER TABLE `system_backup`
  ADD PRIMARY KEY (`backup_id`);

--
-- Indexes for table `test_cases`
--
ALTER TABLE `test_cases`
  ADD PRIMARY KEY (`test_case_id`),
  ADD KEY `problem_id` (`problem_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`user_permission_id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`permission_id`),
  ADD KEY `user_permissions_ibfk_2` (`permission_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_roles_ibfk_1` (`user_id`),
  ADD KEY `user_roles_ibfk_2` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_sessions`
--
ALTER TABLE `active_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=222;

--
-- AUTO_INCREMENT for table `approvals`
--
ALTER TABLE `approvals`
  MODIFY `approval_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `audit_trail`
--
ALTER TABLE `audit_trail`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `content_items`
--
ALTER TABLE `content_items`
  MODIFY `content_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `duel_lobby_messages`
--
ALTER TABLE `duel_lobby_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=174;

--
-- AUTO_INCREMENT for table `duel_lobby_players`
--
ALTER TABLE `duel_lobby_players`
  MODIFY `lobby_player_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=403;

--
-- AUTO_INCREMENT for table `duel_lobby_rooms`
--
ALTER TABLE `duel_lobby_rooms`
  MODIFY `lobby_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT for table `duel_matches`
--
ALTER TABLE `duel_matches`
  MODIFY `match_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=256;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `participant_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_schedule`
--
ALTER TABLE `event_schedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `match_records`
--
ALTER TABLE `match_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `pending_abandonment_notifications`
--
ALTER TABLE `pending_abandonment_notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `problems`
--
ALTER TABLE `problems`
  MODIFY `problem_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `problem_submissions`
--
ALTER TABLE `problem_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `problem_topics`
--
ALTER TABLE `problem_topics`
  MODIFY `topic_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `problem_user_progression`
--
ALTER TABLE `problem_user_progression`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `problem_user_progression_draft_code`
--
ALTER TABLE `problem_user_progression_draft_code`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `role_permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_activity_log`
--
ALTER TABLE `room_activity_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_players`
--
ALTER TABLE `room_players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `solution_submissions`
--
ALTER TABLE `solution_submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spectator_sessions`
--
ALTER TABLE `spectator_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `statistic`
--
ALTER TABLE `statistic`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `system_backup`
--
ALTER TABLE `system_backup`
  MODIFY `backup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `test_cases`
--
ALTER TABLE `test_cases`
  MODIFY `test_case_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=443;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `user_permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `active_sessions`
--
ALTER TABLE `active_sessions`
  ADD CONSTRAINT `active_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `approvals`
--
ALTER TABLE `approvals`
  ADD CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`content_item_id`) REFERENCES `content_items` (`content_item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `approvals_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `approvals_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `audit_trail`
--
ALTER TABLE `audit_trail`
  ADD CONSTRAINT `audit_trail_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `blogs`
--
ALTER TABLE `blogs`
  ADD CONSTRAINT `blogs_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `blog_likes`
--
ALTER TABLE `blog_likes`
  ADD CONSTRAINT `blog_likes_ibfk_1` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`blog_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `blog_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `content_blogs`
--
ALTER TABLE `content_blogs`
  ADD CONSTRAINT `content_blogs_ibfk_1` FOREIGN KEY (`content_item_id`) REFERENCES `content_items` (`content_item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `content_blogs_ibfk_2` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`blog_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `content_events`
--
ALTER TABLE `content_events`
  ADD CONSTRAINT `content_events_ibfk_1` FOREIGN KEY (`content_item_id`) REFERENCES `content_items` (`content_item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `content_events_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `content_problems`
--
ALTER TABLE `content_problems`
  ADD CONSTRAINT `content_problems_ibfk_1` FOREIGN KEY (`content_item_id`) REFERENCES `content_items` (`content_item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `content_problems_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `duel_lobby_messages`
--
ALTER TABLE `duel_lobby_messages`
  ADD CONSTRAINT `fk_duel_lobby_msg_room` FOREIGN KEY (`lobby_id`) REFERENCES `duel_lobby_rooms` (`lobby_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_duel_lobby_msg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `duel_lobby_players`
--
ALTER TABLE `duel_lobby_players`
  ADD CONSTRAINT `fk_duel_lobby_room` FOREIGN KEY (`lobby_id`) REFERENCES `duel_lobby_rooms` (`lobby_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_duel_lobby_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `duel_lobby_rooms`
--
ALTER TABLE `duel_lobby_rooms`
  ADD CONSTRAINT `fk_duel_lobby_host` FOREIGN KEY (`host_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_duel_lobby_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE SET NULL;

--
-- Constraints for table `duel_matches`
--
ALTER TABLE `duel_matches`
  ADD CONSTRAINT `duel_matches_ibfk_1` FOREIGN KEY (`player1_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `duel_matches_ibfk_2` FOREIGN KEY (`player2_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `duel_matches_ibfk_3` FOREIGN KEY (`winner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`host_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `event_schedule`
--
ALTER TABLE `event_schedule`
  ADD CONSTRAINT `event_schedule_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `match_records`
--
ALTER TABLE `match_records`
  ADD CONSTRAINT `match_records_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `duel_matches` (`match_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `match_records_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `pending_abandonment_notifications`
--
ALTER TABLE `pending_abandonment_notifications`
  ADD CONSTRAINT `pending_abandonment_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `problems_have_topics`
--
ALTER TABLE `problems_have_topics`
  ADD CONSTRAINT `problems_have_topics_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `problems_have_topics_ibfk_2` FOREIGN KEY (`topic_id`) REFERENCES `problem_topics` (`topic_id`) ON DELETE CASCADE;

--
-- Constraints for table `problem_submissions`
--
ALTER TABLE `problem_submissions`
  ADD CONSTRAINT `fk_ps_problemid_to_problems_problemid` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ps_userid_to_users_userid` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `problem_user_progression`
--
ALTER TABLE `problem_user_progression`
  ADD CONSTRAINT `fk_problemuserprogression_userid_to_user_userid` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `problem_user_progression_draft_code`
--
ALTER TABLE `problem_user_progression_draft_code`
  ADD CONSTRAINT `fk_pupdc_pupid_to_pup_pupid` FOREIGN KEY (`problem_user_progress_id`) REFERENCES `problem_user_progression` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`host_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room_activity_log`
--
ALTER TABLE `room_activity_log`
  ADD CONSTRAINT `room_activity_log_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `room_activity_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room_players`
--
ALTER TABLE `room_players`
  ADD CONSTRAINT `room_players_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `room_players_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `solution_submissions`
--
ALTER TABLE `solution_submissions`
  ADD CONSTRAINT `solution_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `solution_submissions_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `spectator_sessions`
--
ALTER TABLE `spectator_sessions`
  ADD CONSTRAINT `spectator_sessions_ibfk_1` FOREIGN KEY (`spectator_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `spectator_sessions_ibfk_2` FOREIGN KEY (`lobby_id`) REFERENCES `duel_lobby_rooms` (`lobby_id`) ON DELETE CASCADE;

--
-- Constraints for table `statistic`
--
ALTER TABLE `statistic`
  ADD CONSTRAINT `fk_user_user_id_to_statistic_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `test_cases`
--
ALTER TABLE `test_cases`
  ADD CONSTRAINT `test_cases_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
