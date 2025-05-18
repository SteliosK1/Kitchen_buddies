-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Εξυπηρετητής: 127.0.0.1
-- Χρόνος δημιουργίας: 18 Μάη 2025 στις 16:08:59
-- Έκδοση διακομιστή: 10.4.32-MariaDB
-- Έκδοση PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `kitchen_buddies`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `external_recipes`
--

CREATE TABLE `external_recipes` (
  `id` varchar(20) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `ingredients` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `external_recipes`
--

INSERT INTO `external_recipes` (`id`, `title`, `image_url`, `instructions`, `ingredients`) VALUES
('52948', 'Wontons', 'https://www.themealdb.com/images/media/meals/1525876468.jpg', 'Combine pork, garlic, ginger, soy sauce, sesame oil, and vegetables in a bowl.\r\nSeparate wonton skins.\r\nPlace a heaping teaspoon of filling in the center of the wonton.\r\nBrush water on 2 borders of the skin, covering 1/4 inch from the edge.\r\nFold skin over to form a triangle, sealing edges.\r\nPinch the two long outside points together.\r\nHeat oil to 450 degrees and fry 4 to 5 at a time until golden.\r\nDrain and serve with sauce.', '[\"1lb Pork\",\"3 chopped Garlic Clove\",\"1 tsp  Ginger\",\"1 tbs Soy Sauce\",\"1 tsp  Sesame Seed Oil\",\"3 finely chopped Carrots\",\"3 finely chopped Celery\",\"6 chopped Spring Onions\",\"1 Packet Wonton Skin\",\"Fry Oil\",\"Bottle Water\"]');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `recipe_id`) VALUES
(70, 3, 52948),
(71, 3, 52949),
(72, 3, 52952),
(125, 5, 52947),
(126, 5, 52948),
(127, 5, 52949),
(128, 5, 52950);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `source` enum('user','api') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `recipe_id`, `rating`, `source`) VALUES
(57, 3, 52948, 1, 'user'),
(59, 5, 52948, 4, 'user'),
(91, 3, 52949, 1, 'user'),
(97, 3, 52947, 2, 'user'),
(104, 3, 2, 5, 'user'),
(105, 5, 2, 5, 'user'),
(107, 5, 52947, 3, 'user');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `bio` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `phone`, `address`, `bio`) VALUES
(3, 'stelios ', 'int02476@uoi.gr', '$2b$10$.WyC7JLCOkAEDBsk/PjLb.OjF8eCyoh6KWHFfmWQEaVrL0A1USS.e', '6937042571', 'dsadasd', 'smart '),
(5, 'test', 'test@example.com', '$2b$10$NW0n.rcbec0L82HAr3nyiuhohucCaWxR31.2s/M.OFIcSxVOQwAjy', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `user_recipes`
--

CREATE TABLE `user_recipes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image` text DEFAULT NULL,
  `instructions` text NOT NULL,
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`ingredients`)),
  `cook_time` varchar(50) DEFAULT NULL,
  `rating` float DEFAULT 0,
  `image_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `user_recipes`
--

INSERT INTO `user_recipes` (`id`, `user_id`, `title`, `image`, `instructions`, `ingredients`, `cook_time`, `rating`, `image_url`) VALUES
(2, 3, 'test', 'https://www.greekcookingbykaterina.com/greekcooking/img/recipes/recipes/87/gallery/image-makaronia-mploum-me-kokkini-saltsa-0.jpg', 'test', '[\"test\"]', NULL, 0, NULL),
(3, 5, 'dsadas', 'https://www.greekcookingbykaterina.com/greekcooking/img/recipes/recipes/87/gallery/image-makaronia-mploum-me-kokkini-saltsa-0.jpg', 'dsada', '[\"sdadsa\"]', NULL, 0, NULL);

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `external_recipes`
--
ALTER TABLE `external_recipes`
  ADD PRIMARY KEY (`id`);

--
-- Ευρετήρια για πίνακα `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Ευρετήρια για πίνακα `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_recipe` (`user_id`,`recipe_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Ευρετήρια για πίνακα `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Ευρετήρια για πίνακα `user_recipes`
--
ALTER TABLE `user_recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT για άχρηστους πίνακες
--

--
-- AUTO_INCREMENT για πίνακα `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT για πίνακα `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT για πίνακα `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT για πίνακα `user_recipes`
--
ALTER TABLE `user_recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Περιορισμοί για άχρηστους πίνακες
--

--
-- Περιορισμοί για πίνακα `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Περιορισμοί για πίνακα `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Περιορισμοί για πίνακα `user_recipes`
--
ALTER TABLE `user_recipes`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_recipes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
