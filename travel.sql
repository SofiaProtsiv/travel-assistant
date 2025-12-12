-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Дек 09 2025 г., 17:47
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `travel`
--

-- --------------------------------------------------------

--
-- Структура таблицы `attractions`
--

CREATE TABLE `attractions` (
  `id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `lat` decimal(10,6) DEFAULT NULL,
  `lng` decimal(10,6) DEFAULT NULL,
  `ticket_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `transport_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `avg_visit_time` int(11) DEFAULT 60
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `attractions`
--

INSERT INTO `attractions` (`id`, `city_id`, `name`, `description`, `lat`, `lng`, `ticket_price`, `transport_cost`, `avg_visit_time`) VALUES
(1, 1, 'Eiffel Tower', 'Iconic iron lattice tower built in 1889.', 48.858370, 2.294481, 25.00, 3.00, 90),
(2, 1, 'Louvre Museum', 'World-famous art museum, home of the Mona Lisa.', 48.860611, 2.337644, 17.00, 2.50, 120),
(3, 1, 'Notre-Dame Cathedral', 'Historic Gothic cathedral on Île de la Cité.', 48.852968, 2.349902, 10.00, 2.00, 60),
(4, 1, 'Sacré-Cœur', 'White basilica with panoramic views of Paris.', 48.886705, 2.343104, 0.00, 2.50, 45),
(5, 1, 'Champs-Élysées', 'Famous avenue leading to Arc de Triomphe.', 48.869867, 2.307297, 0.00, 1.50, 30),
(6, 1, 'Arc de Triomphe', 'Triumphal arch honoring French soldiers.', 48.873792, 2.295028, 12.00, 2.50, 40),
(7, 1, 'Seine River Cruise', 'Boat tours along the Seine river.', 48.858222, 2.346414, 18.00, 5.00, 60),
(8, 1, 'Montmartre', 'Artistic historic district.', 48.886704, 2.343104, 0.00, 2.00, 60),
(9, 2, 'Basilica of Notre-Dame de Fourvière', 'Famous basilica overlooking the city.', 45.762222, 4.822222, 0.00, 2.00, 60),
(10, 2, 'Parc de la Tête d\'Or', 'Large urban park with zoo and botanical garden.', 45.779700, 4.852300, 5.00, 1.50, 90),
(11, 2, 'Vieux Lyon', 'Historic old town of Lyon.', 45.767000, 4.834000, 0.00, 2.00, 60),
(12, 4, 'Promenade des Anglais', 'Iconic seaside promenade.', 43.695000, 7.265000, 0.00, 1.50, 60),
(13, 4, 'Castle Hill', 'Panoramic view of Nice.', 43.703000, 7.275000, 0.00, 2.00, 45),
(14, 4, 'Old Town (Vieux Nice)', 'Historic district with colorful buildings.', 43.697000, 7.265000, 0.00, 1.50, 60),
(15, 3, 'Old Port of Marseille', 'Historic port area with restaurants and shops.', 43.296500, 5.369800, 0.00, 2.50, 60),
(16, 3, 'Basilique Notre-Dame de la Garde', 'Famous basilica overlooking the city.', 43.295100, 5.369800, 0.00, 5.00, 120),
(17, 3, 'Calanques National Park', 'Beautiful coastal cliffs and nature.', 43.212000, 5.483000, 0.00, 2.00, 60),
(18, 5, 'Brandenburg Gate', 'Iconic neoclassical monument and symbol of Berlin.', 52.516275, 13.377704, 15.00, 2.50, 60),
(19, 5, 'Berlin TV Tower', 'Tallest structure in Berlin with observation deck.', 52.520816, 13.409419, 12.00, 2.50, 120),
(20, 5, 'Museum Island', 'Complex of five internationally significant museums.', 52.516934, 13.401003, 0.00, 2.00, 30),
(21, 5, 'Checkpoint Charlie', 'Famous former border crossing between East and West Berlin.', 52.507443, 13.390391, 0.00, 2.00, 60),
(22, 5, 'East Side Gallery', 'Open-air gallery painted on remaining Berlin Wall.', 52.505022, 13.439722, 0.00, 1.50, 60),
(23, 6, 'Marienplatz', 'Central square with historic buildings and Glockenspiel.', 48.137154, 11.575490, 10.00, 2.00, 90),
(24, 6, 'Nymphenburg Palace', 'Baroque palace with beautiful gardens.', 48.158423, 11.503122, 0.00, 1.50, 60),
(25, 6, 'English Garden', 'One of the largest urban parks in the world.', 48.160299, 11.603781, 15.00, 2.00, 60),
(26, 6, 'BMW Museum', 'Exhibition of BMW cars and motorcycles.', 48.176346, 11.560156, 15.00, 2.00, 90),
(27, 7, 'Miniatur Wunderland', 'World’s largest model railway exhibition.', 53.543764, 9.988158, 10.00, 1.50, 60),
(28, 7, 'Elbphilharmonie', 'Modern concert hall and architectural landmark.', 53.541123, 9.984303, 5.00, 1.50, 45),
(29, 7, 'St. Michael\'s Church', 'Iconic baroque church with observation deck.', 53.550341, 9.993688, 0.00, 1.50, 60),
(30, 8, 'Römer', 'Historic city hall in the old town of Frankfurt.', 50.110587, 8.682121, 10.00, 2.00, 60),
(31, 8, 'Palmengarten', 'Large botanical garden with tropical plants.', 50.123583, 8.654272, 8.00, 2.00, 45),
(32, 8, 'Main Tower', 'Skyscraper with public observation deck.', 50.110908, 8.675729, 18.00, 2.50, 90),
(33, 9, 'Colosseum', 'Ancient Roman gladiatorial arena and iconic landmark.', 41.890210, 12.492231, 12.00, 2.00, 60),
(34, 9, 'Pantheon', 'Well-preserved Roman temple with massive dome.', 41.898610, 12.476872, 12.00, 2.50, 60),
(35, 9, 'Trevi Fountain', 'Famous baroque fountain, must-visit tourist spot.', 41.900932, 12.483313, 0.00, 2.00, 30),
(36, 9, 'Vatican Museums', 'Extensive art collection including Sistine Chapel.', 41.906487, 12.453607, 17.00, 3.00, 120),
(37, 9, 'St. Peter\'s Basilica', 'Famous Vatican basilica with monumental architecture.', 41.902169, 12.453937, 0.00, 2.50, 60),
(38, 9, 'Roman Forum', 'Ancient center of Roman public life.', 41.892465, 12.485324, 16.00, 2.50, 90),
(39, 9, 'Piazza Navona', 'Historic square with fountains and street artists.', 41.899167, 12.473056, 0.00, 2.00, 45),
(40, 10, 'Duomo di Milano', 'Gothic cathedral and symbol of Milan.', 45.464211, 9.191383, 0.00, 2.00, 60),
(41, 10, 'Galleria Vittorio Emanuele II', 'Historic shopping gallery with luxury stores.', 45.466221, 9.189982, 0.00, 1.50, 45),
(42, 10, 'Sforza Castle', 'Historic fortress housing museums and art collections.', 45.470731, 9.179999, 10.00, 2.00, 90),
(43, 10, 'Teatro alla Scala', 'World-famous opera house.', 45.467451, 9.189153, 15.00, 1.50, 60),
(44, 11, 'St. Mark\'s Basilica', 'Famous cathedral with stunning mosaics.', 45.434006, 12.339898, 0.00, 1.50, 60),
(45, 11, 'Doge\'s Palace', 'Historic palace and museum.', 45.433565, 12.339047, 12.00, 1.50, 60),
(46, 11, 'Rialto Bridge', 'Famous bridge over the Grand Canal.', 45.438713, 12.335050, 0.00, 1.50, 30),
(47, 11, 'Grand Canal', 'Main waterway of Venice with beautiful palaces.', 45.440847, 12.315515, 0.00, 1.50, 60),
(48, 12, 'Duomo di Firenze', 'Cathedral of Florence with Brunelleschi’s Dome.', 43.773062, 11.256051, 0.00, 1.50, 60),
(49, 12, 'Uffizi Gallery', 'World-renowned art museum.', 43.768731, 11.255984, 20.00, 1.50, 120),
(50, 12, 'Ponte Vecchio', 'Historic bridge with shops.', 43.767895, 11.253020, 0.00, 1.50, 30),
(51, 12, 'Palazzo Pitti', 'Renaissance palace housing museums.', 43.767704, 11.248274, 15.00, 1.50, 90),
(52, 13, 'Royal Palace of Madrid', 'Official residence of the Spanish royal family.', 40.417986, -3.714312, 12.00, 2.00, 60),
(53, 13, 'Plaza Mayor', 'Historic square in the heart of Madrid.', 40.415363, -3.707398, 0.00, 1.50, 45),
(54, 13, 'Prado Museum', 'World-famous art museum with European masterpieces.', 40.413780, -3.692127, 15.00, 2.50, 120),
(55, 13, 'Santiago Bernabéu Stadium', 'Home stadium of Real Madrid football club.', 40.453054, -3.688344, 0.00, 2.00, 60),
(56, 13, 'Retiro Park', 'Large park with gardens, sculptures, and a lake.', 40.415260, -3.684360, 0.00, 1.50, 60),
(57, 14, 'Sagrada Familia', 'Famous basilica designed by Antoni Gaudí.', 41.403629, 2.174356, 15.00, 2.00, 90),
(58, 14, 'Park Güell', 'Colorful park with unique architecture by Gaudí.', 41.414494, 2.152694, 0.00, 1.50, 60),
(59, 14, 'Camp Nou', 'Home stadium of FC Barcelona.', 41.380898, 2.122820, 20.00, 2.50, 120),
(60, 14, 'La Rambla', 'Famous pedestrian street with shops and street performers.', 41.381770, 2.172492, 0.00, 1.50, 60),
(61, 14, 'Barceloneta Beach', 'Popular city beach with promenade.', 41.378168, 2.189825, 0.00, 1.50, 60),
(62, 15, 'Seville Cathedral', 'Largest Gothic cathedral with La Giralda tower.', 37.386055, -5.992555, 0.00, 1.50, 60),
(63, 15, 'Alcázar of Seville', 'Royal palace originally developed by Moorish Muslim kings.', 37.383055, -5.991111, 10.00, 1.50, 60),
(64, 15, 'Metropol Parasol', 'Modern wooden structure with panoramic views.', 37.393055, -5.995833, 5.00, 1.50, 30),
(65, 15, 'Plaza de España', 'Impressive semicircular plaza with canals.', 37.377222, -5.986389, 0.00, 1.50, 60),
(66, 16, 'City of Arts and Sciences', 'Modern architectural complex with museums and aquarium.', 39.454211, -0.351344, 15.00, 2.00, 90),
(67, 16, 'Valencia Cathedral', 'Historic cathedral with Gothic and Romanesque elements.', 39.475194, -0.376517, 0.00, 1.50, 60),
(68, 16, 'L’Oceanogràfic', 'Largest aquarium in Europe.', 39.454079, -0.349296, 18.00, 2.00, 120),
(69, 16, 'Turia Gardens', 'Urban park running through the city.', 39.466667, -0.375000, 0.00, 1.50, 60),
(70, 17, 'Buckingham Palace', 'Official residence of the British monarch.', 51.501364, -0.141890, 0.00, 2.50, 60),
(71, 17, 'Tower of London', 'Historic castle and former royal palace.', 51.508112, -0.075949, 25.00, 2.00, 90),
(72, 17, 'British Museum', 'World-famous museum with extensive collections.', 51.519413, -0.126957, 0.00, 1.50, 120),
(73, 17, 'Big Ben & Houses of Parliament', 'Iconic clock tower and seat of UK Parliament.', 51.500729, -0.124625, 0.00, 1.50, 30),
(74, 17, 'Wembley Stadium', 'Home stadium for England national football team.', 51.556021, -0.279519, 0.00, 2.00, 60),
(75, 17, 'London Eye', 'Giant observation wheel with panoramic city views.', 51.503324, -0.119543, 15.00, 2.00, 60),
(76, 18, 'Edinburgh Castle', 'Historic fortress dominating city skyline.', 55.948594, -3.199913, 0.00, 1.50, 60),
(77, 18, 'Royal Mile', 'Famous street connecting castle and palace.', 55.951482, -3.189040, 0.00, 1.50, 30),
(78, 18, 'Arthur\'s Seat', 'Extinct volcano offering panoramic views of Edinburgh.', 55.944053, -3.161523, 0.00, 2.00, 60),
(79, 18, 'Holyrood Palace', 'Official residence of the monarch in Scotland.', 55.952321, -3.172635, 0.00, 1.50, 60),
(80, 19, 'Old Trafford', 'Home stadium of Manchester United football club.', 53.463059, -2.291340, 0.00, 2.00, 60),
(81, 19, 'Etihad Stadium', 'Home stadium of Manchester City football club.', 53.483056, -2.200278, 0.00, 2.00, 60),
(82, 19, 'Manchester Cathedral', 'Historic Gothic cathedral in city center.', 53.485050, -2.242273, 0.00, 1.50, 60),
(83, 19, 'Science and Industry Museum', 'Museum highlighting Manchester\'s industrial past.', 53.477833, -2.237457, 0.00, 0.00, 60),
(84, 19, 'John Rylands Library', 'Neo-Gothic library with historic collections.', 53.479153, -2.247573, 0.00, 0.00, 60),
(85, 20, 'Anfield', 'Home stadium of Liverpool FC.', 53.430829, -2.960828, 0.00, 0.00, 60),
(86, 20, 'Goodison Park', 'Home stadium of Everton FC.', 53.438929, -2.966032, 0.00, 0.00, 60),
(87, 20, 'The Beatles Story', 'Museum dedicated to The Beatles.', 53.404444, -2.991389, 0.00, 0.00, 60),
(88, 20, 'Liverpool Cathedral', 'Largest cathedral in the city.', 53.399444, -2.977500, 0.00, 0.00, 60),
(89, 20, 'Albert Dock', 'Historic dock with museums, shops, and restaurants.', 53.401389, -2.991667, 0.00, 0.00, 60),
(90, 21, 'Rijksmuseum', 'National museum showcasing Dutch art and history.', 52.359997, 4.885218, 0.00, 0.00, 60),
(91, 21, 'Van Gogh Museum', 'Museum dedicated to Vincent van Gogh.', 52.358416, 4.881076, 0.00, 0.00, 60),
(92, 21, 'Anne Frank House', 'Historic house and museum about Anne Frank.', 52.375218, 4.883977, 0.00, 0.00, 60),
(93, 21, 'Dam Square', 'Central square with Royal Palace and National Monument.', 52.373169, 4.893248, 0.00, 0.00, 60),
(94, 21, 'Vondelpark', 'Large public park popular for walking and cycling.', 52.358414, 4.868530, 0.00, 0.00, 60),
(95, 21, 'Heineken Experience', 'Interactive brewery tour and tasting.', 52.357998, 4.891556, 0.00, 0.00, 60),
(96, 22, 'Erasmus Bridge', 'Iconic cable-stayed bridge over the Maas river.', 51.911611, 4.486963, 0.00, 0.00, 60),
(97, 22, 'Markthal', 'Modern market hall with food stalls and apartments.', 51.922500, 4.479167, 0.00, 0.00, 60),
(98, 22, 'Cube Houses', 'Unique architectural cube-shaped houses.', 51.914833, 4.481667, 0.00, 0.00, 60),
(99, 22, 'Rotterdam Zoo', 'Popular zoo with international animal collection.', 51.920833, 4.468056, 0.00, 0.00, 60),
(100, 23, 'Mauritshuis', 'Museum with Dutch Golden Age paintings.', 52.080833, 4.314167, 0.00, 0.00, 60),
(101, 23, 'Binnenhof', 'Historic political center of the Netherlands.', 52.079167, 4.314444, 0.00, 0.00, 60),
(102, 23, 'Scheveningen Beach', 'Popular seaside resort and pier.', 52.114167, 4.287500, 0.00, 0.00, 60),
(103, 23, 'Peace Palace', 'International court of justice building.', 52.090278, 4.313056, 0.00, 0.00, 60),
(104, 24, 'Dom Tower', 'Tallest church tower in the Netherlands.', 52.090833, 5.121389, 0.00, 0.00, 60),
(105, 24, 'Canals of Utrecht', 'Historic canals with wharves and terraces.', 52.094167, 5.121944, 0.00, 0.00, 60),
(106, 24, 'Centraal Museum', 'Museum of art, culture, and history.', 52.090833, 5.123611, 0.00, 0.00, 60),
(107, 24, 'Railway Museum', 'Museum showcasing Dutch railway history.', 52.095278, 5.127500, 0.00, 0.00, 60),
(108, 25, 'Royal Castle', 'Historic castle and former residence of Polish monarchs.', 52.247222, 21.013611, 0.00, 0.00, 60),
(109, 25, 'Łazienki Park', 'Large park with palace on the water and peacocks.', 52.216667, 21.033333, 0.00, 0.00, 60),
(110, 25, 'Palace of Culture and Science', 'Tallest building in Poland with panoramic views.', 52.231667, 21.006389, 0.00, 0.00, 60),
(111, 25, 'Old Town Market Square', 'Historic square with colorful townhouses.', 52.247500, 21.017500, 0.00, 0.00, 60),
(112, 25, 'Warsaw Uprising Museum', 'Museum dedicated to 1944 uprising against Nazi occupation.', 52.230833, 21.001389, 0.00, 0.00, 60),
(113, 26, 'Wawel Castle', 'Historic castle with royal chambers and cathedral.', 50.054444, 19.935833, 0.00, 0.00, 60),
(114, 26, 'Main Market Square', 'Largest medieval town square in Europe.', 50.061389, 19.937222, 0.00, 0.00, 60),
(115, 26, 'St. Mary\'s Basilica', 'Gothic church famous for its wooden altarpiece.', 50.061944, 19.939167, 0.00, 0.00, 60),
(116, 26, 'Kazimierz', 'Historic Jewish quarter with synagogues and cafes.', 50.049167, 19.944722, 0.00, 0.00, 60),
(117, 26, 'Schindler\'s Factory Museum', 'Museum about WWII history in Kraków.', 50.051667, 19.949167, 0.00, 0.00, 60),
(118, 27, 'Long Market', 'Historic street with colorful merchant houses.', 54.350833, 18.653611, 0.00, 0.00, 60),
(119, 27, 'Neptune Fountain', 'Famous fountain symbolizing the city.', 54.350833, 18.653056, 0.00, 0.00, 60),
(120, 27, 'St. Mary\'s Church', 'Largest brick church in Europe.', 54.350833, 18.653611, 0.00, 0.00, 60),
(121, 27, 'Gdańsk Crane', 'Medieval port crane on the Motława river.', 54.348611, 18.657222, 0.00, 0.00, 60),
(122, 28, 'Market Square', 'Central square with colorful townhouses and town hall.', 51.109444, 17.032500, 0.00, 0.00, 60),
(123, 28, 'Ostrów Tumski', 'Historic cathedral island with Gothic architecture.', 51.114167, 17.038611, 0.00, 0.00, 60),
(124, 28, 'Centennial Hall', 'Modernist building and UNESCO World Heritage site.', 51.107222, 17.062500, 0.00, 0.00, 60),
(125, 28, 'Wrocław Zoo', 'Largest zoo in Poland.', 51.102500, 17.047222, 0.00, 0.00, 60),
(126, 29, 'Prague Castle', 'Largest ancient castle in the world.', 50.090833, 14.400556, 0.00, 0.00, 60),
(127, 29, 'Charles Bridge', 'Historic bridge with statues connecting Old Town and Prague Castle.', 50.086944, 14.411111, 0.00, 0.00, 60),
(128, 29, 'Old Town Square', 'Historic square with Astronomical Clock.', 50.087500, 14.421389, 0.00, 0.00, 60),
(129, 29, 'St. Vitus Cathedral', 'Gothic cathedral inside Prague Castle.', 50.090278, 14.400833, 0.00, 0.00, 60),
(130, 29, 'Lennon Wall', 'Colorful graffiti wall dedicated to John Lennon.', 50.086111, 14.406944, 0.00, 0.00, 60),
(131, 30, 'Špilberk Castle', 'Historic hilltop castle with museum.', 49.195556, 16.605556, 0.00, 0.00, 60),
(132, 30, 'Cathedral of St. Peter and Paul', 'Gothic cathedral on Petrov hill.', 49.194722, 16.607500, 0.00, 0.00, 60),
(133, 30, 'Villa Tugendhat', 'Modernist villa and UNESCO World Heritage site.', 49.203611, 16.608333, 0.00, 0.00, 60),
(134, 31, 'Ostrava Zoo', 'Popular zoo with European and exotic animals.', 49.825278, 18.246389, 0.00, 0.00, 60),
(135, 31, 'Landek Park', 'Mining museum with old shafts and industrial heritage.', 49.836111, 18.253056, 0.00, 0.00, 60),
(136, 31, 'Stodolní Street', 'Famous nightlife street with bars and clubs.', 49.835833, 18.288611, 0.00, 0.00, 60);

-- --------------------------------------------------------

--
-- Структура таблицы `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL,
  `country_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_capital` tinyint(1) DEFAULT 0,
  `lat` decimal(10,6) DEFAULT NULL,
  `lng` decimal(10,6) DEFAULT NULL,
  `avg_hotel_price` decimal(6,2) DEFAULT 40.00,
  `budget_tier` varchar(20) DEFAULT 'medium',
  `accommodation_cost` int(11) DEFAULT 60,
  `food_cost` int(11) DEFAULT 30,
  `transport_cost` int(11) DEFAULT 10,
  `attraction_cost` int(11) DEFAULT 15,
  `shopping_cost` int(11) DEFAULT 40,
  `popularity_score` int(11) DEFAULT 50,
  `safety_score` int(11) DEFAULT 70,
  `food_quality_score` int(11) DEFAULT 60,
  `public_transport_score` int(11) DEFAULT 65,
  `nightlife_score` int(11) DEFAULT 55,
  `family_friendly_score` int(11) DEFAULT 60,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `cities`
--

INSERT INTO `cities` (`id`, `country_id`, `name`, `is_capital`, `lat`, `lng`, `avg_hotel_price`, `budget_tier`, `accommodation_cost`, `food_cost`, `transport_cost`, `attraction_cost`, `shopping_cost`, `popularity_score`, `safety_score`, `food_quality_score`, `public_transport_score`, `nightlife_score`, `family_friendly_score`, `updated_at`) VALUES
(1, 1, 'Париж', 1, 48.856613, 2.352222, 120.00, 'luxury', 80, 40, 15, 20, 50, 90, 75, 85, 80, 70, 65, '2025-12-06 16:33:33'),
(2, 1, 'Ліон', 0, 45.767311, 4.834310, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(3, 1, 'Марсель', 0, 43.296482, 5.369780, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(4, 1, 'Ніцца', 0, 43.710173, 7.261953, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(5, 2, 'Берлін', 1, 52.520008, 13.404954, 120.00, 'luxury', 80, 40, 15, 20, 50, 90, 75, 85, 80, 70, 65, '2025-12-06 16:33:33'),
(6, 2, 'Мюнхен', 0, 48.137154, 11.576124, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(7, 2, 'Гамбург', 0, 53.551086, 9.993682, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(8, 2, 'Франкфурт', 0, 50.110924, 8.682127, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(9, 3, 'Рим', 1, 41.902782, 12.496366, 120.00, 'luxury', 80, 40, 15, 20, 50, 90, 75, 85, 80, 70, 65, '2025-12-06 16:33:33'),
(10, 3, 'Мілан', 0, 45.464664, 9.188540, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(11, 3, 'Венеція', 0, 45.440847, 12.315515, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(12, 3, 'Флоренція', 0, 43.769562, 11.255814, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(13, 4, 'Мадрид', 1, 40.416775, -3.703790, 120.00, 'luxury', 80, 40, 15, 20, 50, 90, 75, 85, 80, 70, 65, '2025-12-06 16:33:33'),
(14, 4, 'Барселона', 0, 41.385064, 2.173404, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(15, 4, 'Севілья', 0, 37.389092, -5.984459, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(16, 4, 'Валенсія', 0, 39.469907, -0.376288, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(17, 5, 'Лондон', 1, 51.507351, -0.127758, 120.00, 'luxury', 80, 40, 15, 20, 50, 90, 75, 85, 80, 70, 65, '2025-12-06 16:33:33'),
(18, 5, 'Единбург', 0, 55.953251, -3.188267, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(19, 5, 'Манчестер', 0, 53.480759, -2.242631, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(20, 5, 'Ліверпуль', 0, 53.408371, -2.991573, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(21, 6, 'Амстердам', 1, 52.367573, 4.904139, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(22, 6, 'Роттердам', 0, 51.924419, 4.477733, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(23, 6, 'Гаага', 0, 52.070498, 4.300700, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(24, 6, 'Утрехт', 0, 52.090737, 5.121420, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(25, 7, 'Варшава', 1, 52.229676, 21.012229, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(26, 7, 'Краків', 0, 50.064650, 19.944980, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(27, 7, 'Гданськ', 0, 54.352025, 18.646638, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(28, 7, 'Вроцлав', 0, 51.107883, 17.038538, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(29, 8, 'Прага', 1, 50.075538, 14.437800, 65.00, 'budget', 50, 25, 6, 8, 30, 70, 80, 70, 75, 80, 65, '2025-12-06 16:33:33'),
(30, 8, 'Брно', 0, 49.195061, 16.606836, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33'),
(31, 8, 'Острава', 0, 49.820923, 18.262524, 40.00, 'medium', 60, 30, 10, 15, 40, 50, 70, 60, 65, 55, 60, '2025-12-06 16:33:33');

-- --------------------------------------------------------

--
-- Структура таблицы `countries`
--

CREATE TABLE `countries` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `capital_city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `countries`
--

INSERT INTO `countries` (`id`, `name`, `capital_city_id`) VALUES
(1, 'Франція', 1),
(2, 'Німеччина', 5),
(3, 'Італія', 9),
(4, 'Іспанія', 13),
(5, 'Велика Британія', 17),
(6, 'Нідерланди', 21),
(7, 'Польща', 25),
(8, 'Чехія', 29);

-- --------------------------------------------------------

--
-- Структура таблицы `transport_options`
--

CREATE TABLE `transport_options` (
  `id` int(11) NOT NULL,
  `attraction_id` int(11) NOT NULL,
  `type` enum('bus','metro','taxi','walk') NOT NULL,
  `price` decimal(7,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `trips`
--

CREATE TABLE `trips` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `country_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('planned','active','finished') DEFAULT 'planned',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_budget` int(11) DEFAULT NULL,
  `budget_details` text DEFAULT NULL,
  `recommended_plan` longtext DEFAULT NULL,
  `attractions_count` int(11) DEFAULT 0,
  `visited_count` int(11) DEFAULT 0,
  `trip_summary` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `trips`
--

INSERT INTO `trips` (`id`, `user_id`, `country_id`, `city_id`, `start_date`, `end_date`, `status`, `created_at`, `total_budget`, `budget_details`, `recommended_plan`, `attractions_count`, `visited_count`, `trip_summary`) VALUES
(10, 1, 5, 17, NULL, NULL, 'finished', '2025-12-05 19:44:11', NULL, NULL, NULL, 0, 0, NULL),
(11, 1, 1, 2, NULL, NULL, 'finished', '2025-12-05 19:46:34', NULL, NULL, NULL, 0, 0, NULL),
(12, 1, 4, 13, NULL, NULL, 'finished', '2025-12-05 21:38:21', NULL, NULL, NULL, 0, 0, NULL),
(13, 1, 1, 2, NULL, NULL, 'finished', '2025-12-06 14:20:47', NULL, NULL, NULL, 0, 0, NULL),
(14, 1, 1, 2, NULL, NULL, 'finished', '2025-12-06 14:23:45', NULL, NULL, NULL, 0, 0, NULL),
(15, 1, 1, 1, NULL, NULL, 'finished', '2025-12-06 19:39:54', NULL, NULL, NULL, 0, 0, NULL),
(21, 1, 4, 14, NULL, NULL, 'finished', '2025-12-07 11:42:46', NULL, NULL, NULL, 0, 0, NULL),
(22, 1, 4, 14, NULL, NULL, 'finished', '2025-12-07 11:53:04', NULL, NULL, NULL, 0, 0, NULL),
(23, 1, 1, 3, NULL, NULL, 'finished', '2025-12-07 11:53:21', NULL, NULL, NULL, 0, 0, NULL),
(28, 1, 4, 14, NULL, NULL, 'finished', '2025-12-07 12:09:52', NULL, NULL, NULL, 0, 0, NULL),
(29, 1, 4, 14, NULL, NULL, 'finished', '2025-12-07 12:10:24', NULL, NULL, NULL, 0, 0, NULL),
(30, 1, 5, 19, NULL, NULL, 'finished', '2025-12-07 12:15:10', NULL, NULL, NULL, 0, 0, NULL),
(31, 1, 5, 19, NULL, NULL, 'finished', '2025-12-07 12:24:28', NULL, NULL, NULL, 0, 0, NULL),
(32, 1, 7, 25, NULL, NULL, 'finished', '2025-12-07 12:25:25', NULL, NULL, NULL, 0, 0, NULL),
(33, 1, 8, 29, NULL, NULL, 'finished', '2025-12-07 12:25:57', NULL, NULL, NULL, 0, 0, NULL),
(34, 1, 3, 9, NULL, NULL, 'finished', '2025-12-07 12:26:42', NULL, NULL, NULL, 0, 0, NULL),
(35, 1, 4, 13, NULL, NULL, 'finished', '2025-12-07 12:43:33', NULL, NULL, NULL, 0, 0, NULL),
(36, 1, 2, 5, NULL, NULL, 'finished', '2025-12-07 12:43:56', NULL, NULL, NULL, 0, 0, NULL),
(37, 1, 1, 2, NULL, NULL, 'finished', '2025-12-07 12:46:45', NULL, NULL, NULL, 0, 0, NULL),
(38, 1, 4, 16, NULL, NULL, 'finished', '2025-12-07 12:47:35', NULL, NULL, NULL, 0, 0, NULL),
(39, 1, 1, 1, NULL, NULL, 'finished', '2025-12-07 12:53:43', NULL, NULL, NULL, 0, 0, NULL),
(42, 1, 5, 17, NULL, NULL, 'finished', '2025-12-07 13:41:15', NULL, NULL, NULL, 0, 0, NULL),
(45, 1, 2, 5, NULL, NULL, 'finished', '2025-12-07 15:00:12', NULL, NULL, NULL, 0, 0, NULL),
(46, 1, 1, 1, NULL, NULL, 'active', '2025-12-07 15:07:28', NULL, NULL, NULL, 0, 0, NULL),
(47, 1, 1, 3, NULL, NULL, 'active', '2025-12-07 15:14:17', NULL, NULL, NULL, 0, 0, NULL),
(48, 1, 1, 1, NULL, NULL, 'active', '2025-12-07 15:15:45', NULL, NULL, NULL, 0, 0, NULL),
(49, 1, 5, 19, NULL, NULL, 'active', '2025-12-07 15:23:14', NULL, NULL, NULL, 0, 0, NULL),
(50, 1, 4, 14, NULL, NULL, 'active', '2025-12-07 15:27:48', NULL, NULL, NULL, 0, 0, NULL),
(54, 1, 5, 17, NULL, NULL, 'active', '2025-12-07 15:47:50', NULL, NULL, NULL, 0, 0, NULL),
(56, 1, 1, 1, NULL, NULL, 'finished', '2025-12-07 16:14:59', NULL, NULL, NULL, 0, 0, NULL),
(58, 1, 1, 1, NULL, NULL, 'finished', '2025-12-07 21:31:18', NULL, NULL, NULL, 0, 0, NULL),
(59, 1, 2, 6, '2025-12-14', '2025-12-16', 'planned', '2025-12-07 21:38:48', NULL, NULL, NULL, 0, 0, NULL),
(61, 1, 1, 2, NULL, NULL, 'active', '2025-12-08 09:32:43', NULL, NULL, NULL, 0, 0, NULL),
(62, 1, 8, 29, NULL, NULL, 'finished', '2025-12-08 09:38:38', NULL, NULL, NULL, 0, 0, NULL),
(63, 1, 1, 1, NULL, NULL, 'active', '2025-12-09 15:37:58', NULL, NULL, NULL, 0, 0, NULL),
(64, 1, 2, 6, '2025-12-16', '2025-12-18', 'planned', '2025-12-09 15:38:37', NULL, NULL, NULL, 0, 0, NULL),
(65, 1, 1, 4, '2025-12-16', '2025-12-18', 'active', '2025-12-09 15:39:18', NULL, NULL, NULL, 0, 0, NULL),
(66, 1, 3, 9, '2025-12-16', '2025-12-18', 'active', '2025-12-09 16:08:27', 362, '{\"accommodation\":160,\"food\":80,\"transport\":30,\"attractions\":42,\"shopping\":50}', '[{\"day\":1,\"activities\":[{\"time\":\"09:00\",\"place\":\"Colosseum\",\"description\":\"Ancient Roman gladiatorial arena and iconic landmark.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":14},{\"time\":\"11:30\",\"place\":\"Trevi Fountain\",\"description\":\"Famous baroque fountain, must-visit tourist spot.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2},{\"time\":\"14:00\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"15:00\",\"place\":\"Piazza Navona\",\"description\":\"Historic square with fountains and street artists.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2},{\"time\":\"17:30\",\"place\":\"Pantheon\",\"description\":\"Well-preserved Roman temple with massive dome.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":14.5},{\"time\":\"20:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":2,\"activities\":[{\"time\":\"09:00\",\"place\":\"St. Peter\'s Basilica\",\"description\":\"Famous Vatican basilica with monumental architecture.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2.5},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Vatican Museums\",\"description\":\"Extensive art collection including Sistine Chapel.\",\"duration\":\"2 год 0 хв\",\"category\":\"museum\",\"cost\":20},{\"time\":\"15:00\",\"place\":\"Roman Forum\",\"description\":\"Ancient center of Roman public life.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":18.5},{\"time\":\"17:30\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]}]', 7, 0, NULL),
(67, 1, 2, 8, '2025-12-16', '2025-12-18', 'active', '2025-12-09 16:10:46', 297, '{\"accommodation\":120,\"food\":60,\"transport\":20,\"attractions\":57,\"shopping\":40}', '[{\"day\":1,\"activities\":[{\"time\":\"09:00\",\"place\":\"Römer\",\"description\":\"Historic city hall in the old town of Frankfurt.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":12},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Palmengarten\",\"description\":\"Large botanical garden with tropical plants.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":10},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":2,\"activities\":[{\"time\":\"09:00\",\"place\":\"Main Tower\",\"description\":\"Skyscraper with public observation deck.\",\"duration\":\"2 год 0 хв\",\"category\":\"monument\",\"cost\":20.5},{\"time\":\"11:30\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]}]', 3, 0, NULL),
(68, 1, 1, 1, '2025-12-16', '2025-12-19', 'active', '2025-12-09 16:11:12', 798, '{\"accommodation\":360,\"food\":180,\"transport\":68,\"attractions\":116,\"shopping\":75}', '[{\"day\":1,\"activities\":[{\"time\":\"09:00\",\"place\":\"Champs-Élysées\",\"description\":\"Famous avenue leading to Arc de Triomphe.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":1.5},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Notre-Dame Cathedral\",\"description\":\"Historic Gothic cathedral on Île de la Cité.\",\"duration\":\"2 год 0 хв\",\"category\":\"religious\",\"cost\":12},{\"time\":\"15:00\",\"place\":\"Seine River Cruise\",\"description\":\"Boat tours along the Seine river.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":23},{\"time\":\"17:30\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":2,\"activities\":[{\"time\":\"09:00\",\"place\":\"Sacré-Cœur\",\"description\":\"White basilica with panoramic views of Paris.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2.5},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Arc de Triomphe\",\"description\":\"Triumphal arch honoring French soldiers.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":14.5},{\"time\":\"15:00\",\"place\":\"Eiffel Tower\",\"description\":\"Iconic iron lattice tower built in 1889.\",\"duration\":\"2 год 0 хв\",\"category\":\"monument\",\"cost\":28},{\"time\":\"17:30\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":3,\"activities\":[{\"time\":\"09:00\",\"place\":\"Louvre Museum\",\"description\":\"World-famous art museum, home of the Mona Lisa.\",\"duration\":\"2 год 0 хв\",\"category\":\"museum\",\"cost\":19.5},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Montmartre\",\"description\":\"Artistic historic district.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]}]', 8, 0, NULL),
(70, 6, 3, 9, '2025-12-16', '2025-12-21', 'finished', '2025-12-09 16:38:36', 1245, '{\"accommodation\":600,\"food\":300,\"transport\":113,\"attractions\":158,\"shopping\":75}', '[{\"day\":1,\"activities\":[{\"time\":\"09:00\",\"place\":\"Colosseum\",\"description\":\"Ancient Roman gladiatorial arena and iconic landmark.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":14},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Roman Forum\",\"description\":\"Ancient center of Roman public life.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":18.5},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":2,\"activities\":[{\"time\":\"09:00\",\"place\":\"Trevi Fountain\",\"description\":\"Famous baroque fountain, must-visit tourist spot.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"St. Peter\'s Basilica\",\"description\":\"Famous Vatican basilica with monumental architecture.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2.5},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":3,\"activities\":[{\"time\":\"09:00\",\"place\":\"Piazza Navona\",\"description\":\"Historic square with fountains and street artists.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":2},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Pantheon\",\"description\":\"Well-preserved Roman temple with massive dome.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":14.5},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":4,\"activities\":[{\"time\":\"09:00\",\"place\":\"Vatican Museums\",\"description\":\"Extensive art collection including Sistine Chapel.\",\"duration\":\"2 год 0 хв\",\"category\":\"museum\",\"cost\":20},{\"time\":\"11:30\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":5,\"activities\":[{\"time\":\"09:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]}]', 7, 0, NULL),
(71, 6, 5, 20, '2025-12-16', '2025-12-19', 'finished', '2025-12-09 16:40:25', 510, '{\"accommodation\":270,\"food\":135,\"transport\":45,\"attractions\":0,\"shopping\":60}', '[{\"day\":1,\"activities\":[{\"time\":\"09:00\",\"place\":\"Albert Dock\",\"description\":\"Historic dock with museums, shops, and restaurants.\",\"duration\":\"2 год 0 хв\",\"category\":\"museum\",\"cost\":0},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"The Beatles Story\",\"description\":\"Museum dedicated to The Beatles.\",\"duration\":\"2 год 0 хв\",\"category\":\"museum\",\"cost\":0},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":2,\"activities\":[{\"time\":\"09:00\",\"place\":\"Anfield\",\"description\":\"Home stadium of Liverpool FC.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":0},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Goodison Park\",\"description\":\"Home stadium of Everton FC.\",\"duration\":\"2 год 0 хв\",\"category\":\"park\",\"cost\":0},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":3,\"activities\":[{\"time\":\"09:00\",\"place\":\"Liverpool Cathedral\",\"description\":\"Largest cathedral in the city.\",\"duration\":\"2 год 0 хв\",\"category\":\"religious\",\"cost\":0},{\"time\":\"11:30\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]}]', 5, 0, NULL),
(72, 6, 2, 6, '2025-12-16', '2025-12-18', 'active', '2025-12-09 16:42:43', 288, '{\"accommodation\":120,\"food\":60,\"transport\":20,\"attractions\":48,\"shopping\":40}', '[{\"day\":1,\"activities\":[{\"time\":\"09:00\",\"place\":\"BMW Museum\",\"description\":\"Exhibition of BMW cars and motorcycles.\",\"duration\":\"2 год 0 хв\",\"category\":\"museum\",\"cost\":17},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Marienplatz\",\"description\":\"Central square with historic buildings and Glockenspiel.\",\"duration\":\"2 год 0 хв\",\"category\":\"landmark\",\"cost\":12},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]},{\"day\":2,\"activities\":[{\"time\":\"09:00\",\"place\":\"English Garden\",\"description\":\"One of the largest urban parks in the world.\",\"duration\":\"2 год 0 хв\",\"category\":\"park\",\"cost\":17},{\"time\":\"11:30\",\"place\":\"Обід\",\"description\":\"Вільний час для обіду\",\"duration\":\"60 хв\",\"category\":\"food\",\"cost\":0},{\"time\":\"12:30\",\"place\":\"Nymphenburg Palace\",\"description\":\"Baroque palace with beautiful gardens.\",\"duration\":\"2 год 0 хв\",\"category\":\"castle\",\"cost\":1.5},{\"time\":\"15:00\",\"place\":\"Вільний час\",\"description\":\"Відпочинок, вечеря, прогулянка\",\"duration\":\"120 хв\",\"category\":\"free\",\"cost\":0}]}]', 4, 0, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `trip_attractions`
--

CREATE TABLE `trip_attractions` (
  `id` int(11) NOT NULL,
  `trip_id` int(11) NOT NULL,
  `attraction_id` int(11) NOT NULL,
  `day_number` int(11) DEFAULT 1,
  `visit_order` int(11) DEFAULT NULL,
  `is_visited` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `trip_attractions`
--

INSERT INTO `trip_attractions` (`id`, `trip_id`, `attraction_id`, `day_number`, `visit_order`, `is_visited`) VALUES
(23, 10, 73, 1, 1, 1),
(24, 10, 74, 1, 2, 1),
(25, 10, 72, 1, 3, 1),
(26, 10, 71, 1, 4, 1),
(27, 11, 11, 1, 1, 1),
(33, 12, 54, 1, 1, 0),
(34, 12, 56, 1, 2, 0),
(35, 12, 55, 2, 3, 0),
(36, 12, 52, 3, 5, 0),
(37, 12, 53, 2, 4, 0),
(38, 13, 11, 1, 1, 1),
(39, 13, 10, 2, 2, 1),
(40, 13, 9, 3, 3, 1),
(41, 14, 11, 1, 1, 1),
(42, 14, 10, 2, 2, 1),
(43, 14, 9, 3, 3, 1),
(44, 15, 2, 1, 1, 1),
(45, 15, 8, 2, 2, 1),
(46, 15, 5, 3, 3, 1),
(47, 15, 1, 3, 4, 1),
(52, 21, 57, 1, 1, 1),
(53, 21, 60, 1, 2, 1),
(54, 22, 57, 1, 1, 1),
(55, 22, 60, 1, 2, 1),
(56, 23, 17, 1, 1, 1),
(57, 23, 16, 1, 2, 1),
(74, 28, 57, 1, 1, 1),
(75, 29, 57, 1, 1, 1),
(76, 30, 83, 1, 1, 0),
(77, 30, 80, 1, 2, 0),
(78, 31, 83, 1, 1, 1),
(79, 31, 80, 1, 2, 1),
(80, 32, 110, 1, 1, 1),
(81, 32, 111, 1, 2, 1),
(82, 33, 127, 1, 1, 1),
(83, 34, 39, 1, 1, 1),
(84, 35, 54, 1, 1, 1),
(85, 36, 22, 1, 1, 1),
(86, 37, 11, 1, 1, 1),
(87, 38, 66, 1, 1, 1),
(88, 38, 67, 1, 2, 1),
(89, 39, 2, 1, 1, 1),
(96, 42, 71, 1, 1, 1),
(97, 42, 73, 1, 2, 1),
(98, 47, 16, 1, 1, 0),
(99, 47, 17, 1, 2, 0),
(100, 49, 100, 1, 1, 0),
(101, 49, 101, 1, 2, 0),
(102, 49, 102, 2, 1, 0),
(103, 49, 80, 1, 1, 0),
(104, 49, 81, 1, 2, 0),
(105, 49, 82, 1, 3, 0),
(118, 54, 72, 1, 1, 0),
(119, 54, 71, 1, 2, 0),
(120, 54, 70, 1, 3, 0),
(133, 56, 1, 1, 1, 1),
(134, 56, 2, 1, 2, 1),
(135, 56, 5, 2, 3, 1),
(136, 56, 8, 2, 4, 1),
(137, 56, 3, 3, 5, 1),
(146, 58, 1, 1, 1, 1),
(147, 58, 2, 1, 2, 1),
(148, 58, 8, 1, 3, 1),
(149, 58, 7, 2, 4, 1),
(150, 58, 6, 3, 5, 1),
(162, 61, 11, 1, 1, 1),
(163, 61, 10, 2, 2, 1),
(164, 61, 9, 3, 3, 1),
(165, 62, 128, 1, 1, 1),
(166, 62, 127, 1, 2, 1),
(167, 62, 130, 2, 3, 1),
(168, 62, 129, 2, 4, 1),
(169, 62, 126, 3, 5, 1),
(170, 63, 3, 1, 1, 1),
(171, 63, 5, 2, 2, 1),
(172, 63, 1, 2, 3, 0),
(173, 63, 8, 3, 4, 0),
(174, 63, 2, 3, 5, 1),
(175, 66, 33, 1, 0, 0),
(176, 66, 34, 1, 1, 0),
(177, 66, 35, 1, 2, 0),
(178, 66, 36, 1, 3, 0),
(179, 66, 37, 1, 4, 0),
(180, 66, 38, 1, 5, 0),
(181, 66, 39, 1, 6, 0),
(182, 67, 30, 1, 0, 0),
(183, 67, 31, 1, 1, 0),
(184, 67, 32, 2, 2, 0),
(185, 68, 1, 1, 0, 1),
(186, 68, 2, 1, 1, 1),
(187, 68, 3, 1, 2, 1),
(188, 68, 4, 2, 3, 0),
(189, 68, 5, 2, 4, 0),
(190, 68, 6, 2, 5, 0),
(191, 68, 7, 3, 6, 0),
(192, 68, 8, 3, 7, 0),
(198, 70, 33, 1, 0, 1),
(199, 70, 34, 1, 1, 1),
(200, 70, 35, 2, 2, 1),
(201, 70, 36, 2, 3, 1),
(202, 70, 37, 3, 4, 1),
(203, 70, 38, 3, 5, 1),
(204, 70, 39, 4, 6, 1),
(205, 71, 85, 1, 0, 1),
(206, 71, 86, 1, 1, 1),
(207, 71, 87, 2, 2, 1),
(208, 71, 88, 2, 3, 1),
(209, 71, 89, 3, 4, 1),
(210, 72, 23, 1, 0, 0),
(211, 72, 24, 1, 1, 0),
(212, 72, 25, 2, 2, 0),
(213, 72, 26, 2, 3, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`) VALUES
(1, 'procivsvatoslav@gmail.com', '34pro100', '2025-11-27 12:47:45'),
(4, 'gkofdijgdiof@gmail.com', 'Sviatoslav228', '2025-12-07 14:31:49'),
(5, 'gfdg@gmail.com', '34pro100', '2025-12-07 14:34:09'),
(6, 'glfdogijdfn@gmail.com', '34pro100', '2025-12-07 16:13:39');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `attractions`
--
ALTER TABLE `attractions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `city_id` (`city_id`);

--
-- Индексы таблицы `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `country_id` (`country_id`);

--
-- Индексы таблицы `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_capital` (`capital_city_id`);

--
-- Индексы таблицы `transport_options`
--
ALTER TABLE `transport_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attraction_id` (`attraction_id`);

--
-- Индексы таблицы `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `country_id` (`country_id`),
  ADD KEY `city_id` (`city_id`);

--
-- Индексы таблицы `trip_attractions`
--
ALTER TABLE `trip_attractions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trip_id` (`trip_id`),
  ADD KEY `attraction_id` (`attraction_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `attractions`
--
ALTER TABLE `attractions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT для таблицы `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT для таблицы `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `transport_options`
--
ALTER TABLE `transport_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `trips`
--
ALTER TABLE `trips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT для таблицы `trip_attractions`
--
ALTER TABLE `trip_attractions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=214;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `attractions`
--
ALTER TABLE `attractions`
  ADD CONSTRAINT `attractions_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `countries`
--
ALTER TABLE `countries`
  ADD CONSTRAINT `fk_capital` FOREIGN KEY (`capital_city_id`) REFERENCES `cities` (`id`);

--
-- Ограничения внешнего ключа таблицы `transport_options`
--
ALTER TABLE `transport_options`
  ADD CONSTRAINT `transport_options_ibfk_1` FOREIGN KEY (`attraction_id`) REFERENCES `attractions` (`id`);

--
-- Ограничения внешнего ключа таблицы `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trips_ibfk_3` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `trip_attractions`
--
ALTER TABLE `trip_attractions`
  ADD CONSTRAINT `trip_attractions_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trip_attractions_ibfk_2` FOREIGN KEY (`attraction_id`) REFERENCES `attractions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
