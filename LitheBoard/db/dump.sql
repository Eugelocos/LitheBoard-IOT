-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: bizoepeecwuj1ltr1bxy-mysql.services.clever-cloud.com:3306
-- Tiempo de generación: 19-12-2024 a las 19:51:51
-- Versión del servidor: 8.0.22-13
-- Versión de PHP: 8.2.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;
SET NAMES utf8mb4;

--
-- Base de datos: `bizoepeecwuj1ltr1bxy`
--
CREATE DATABASE IF NOT EXISTS `litheboard_db` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `litheboard_db`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `access_levels`
--

CREATE TABLE `access_levels` (
  `level_id` int NOT NULL,
  `level_name` varchar(50) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `access_levels`
--

INSERT INTO `access_levels` (`level_id`, `level_name`, `description`) VALUES
(1, 'Admin', 'Administrador con acceso completo'),
(2, 'Cliente', 'Usuario con acceso limitado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alarms`
--

CREATE TABLE `alarms` (
  `alarm_id` int NOT NULL,
  `valor` varchar(255) DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `alarm_condition` enum('>','<') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `selected_key` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clients`
--

CREATE TABLE `clients` (
  `client_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `access_level_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `clients`
--

INSERT INTO `clients` (`client_id`, `name`, `email`, `password`, `access_level_id`, `admin_id`) VALUES
(1, 'admin', 'admin@gmail.com', 'admin', NULL, NULL),
(3, 'e', 'eq@q.conm', '$2b$10$zT/692Lp.8e4djKogRkNfO70gPZsKeQYXvLNbJhZsl9WEZWupQ66a', NULL, NULL),
(4, 'Eugenio Falabella', 'eugeniofalabella@gmail.com', '$2b$10$Zn20B9zGckOUy5LLJkI5s.tl6WBBJZlJiVMQcib.J8PEDw7RXMzuC', 1, NULL),
(5, 'Eugenio Falabella', 'eugeniofalabella@gmail.com', '$2b$10$oAuevKG7rfOhPbqiF2B7.OGkYrbhD6bnYnAX4QlChMQsuUnnap0oG', NULL, NULL),
(6, 'Eugenio Falabella', 'etincorporarions@gmail.com', '$2b$10$kI7EqXqJZ0kXTpg/5pYCFuzKjWAQoMO8GcAzvTMMHHh/4euKz26Mi', 1, NULL),
(7, 'customerA', 'Rr@yahoo.net', '$2b$10$jG5c1Q3d4R3cx.liNvQCDettl7/8xLDqHYhBtmkG7fo5bRJ6xne1G', NULL, NULL),
(8, 'r', 'r@r.not', '$2b$10$zvcNK0WaTbrnfzrJE/2L1Oe0QZjF7Zlu2j6WHME3KK7Mu8doMNUMC', NULL, NULL),
(9, 'gaston', 'gfalabella@gmail.com', '$2b$10$DU9CxTrZdedvXUakEP.Isud6Hc.Kw2WuSzqxROEK3deS7Jm87ZxYq', NULL, NULL),
(10, 'diana', 'diana@gmail.com', '$2b$10$w.SO9bx39uRBbfnus3loV.qplQs8O0JlNAERSpaEo4n3vlc8CGxrK', NULL, NULL),
(11, 'e', 'admin@gmail.com', '$2a$10$xulnXbgLqvh/gXc0gipze.daxaG9mJ07ycbEYBUDAy1bZwUnQ6oji', NULL, NULL),
(12, 'd', 'eq@q.conm', '$2a$10$IRW0Kb8bYnMF9IcEMhrDCuYZ5eETfcIlBkk2RQqtnWR5RBJZamcye', NULL, NULL),
(13, 'Administrador', 'admin@gmail.com', '$2a$10$RTppFqW38knWarKkyhPumOdllT5Fg5Yuc2ukl.jLEQSYU0m3zkI3S', NULL, NULL),
(14, 'mamucha', 'mamucha@gmail.com', '$2a$10$43ptlr/WC6BTpDUCWa5LHu13F3aLOoCd5JsFJt7RfdYQYkxb09PRK', NULL, NULL),
(17, 'customer_A', 'testClient_1@gmail.com', '$2b$10$1y.1Sj3/KCCWPuPCc3pav.oOWN/ZbijrSZ3x5ZB43ew4Pd7BlEkR2', NULL, 1),
(20, 'customer_A', 'falabellaeuge@gmail.com', '$2a$10$vwZIUTlELMzLgAc7znlSIuRoyqA5oyGTA00Y7Xfaq4LvLi0pOXYAG', 2, 4),
(21, 'customer_B', 'etincorporarions@gmail.com', '$2a$10$iCMcNDY3lexzLu1OKIyMvetaiq1BR/tnaNvdLccayYtQOX3oqyxa6', 2, 4),
(22, 'customer_C', 'etincorporarions@gmail.com', '$2a$10$rJ.wDJ1rCSMRl.5o7usVpOTgksss28ThETceBYw2FpwIbvkU/gxUm', 2, 4),
(23, 'Gaston', 'gfalabella@gmail.com', '$2a$10$fPlXaHJCQBszEBkcWOzBnOp.TjpH2brRYUrJhUwNaY2vV3IKjbWy6', 1, 1),
(24, 'Diana', 'dadrover@gail.net', '$2a$10$LK2lfhSsYUgbRZMLBzAz1eCda4lot2B1KF6E2QMiye5RHuMvjhqlq', 2, NULL),
(25, 'Diana ', 'dadrover@yahoo.com.ar.net', '$2a$10$aDDyuaIAJN7386BO7.9lzu7wLQH/wZ.wqOQESpFKlgFpBI/dbBUZq', 2, NULL),
(26, 'ddd', 'drdrd@gmail.com', '$2a$10$Z4tRO691BuUqt0yl.qVYA.TLeiFMeRUhvHQzzca8zZZ9SRr2PLuH.', 2, NULL),
(27, 'Diana', 'dadrover@yahoo.com.ar', '$2a$10$2Y34CgtmWa2EeE6643D.EOLjQ9LfjdEONK9NOAPGr7CTLyIz9blra', 2, 4),
(28, 'Eugenio Falabella', 'testClient_1@gmail.com', '$2b$10$9dD5db8PHs1mN3QAQh.WF.ShkK4ZeQYWjXSFm.PzuO526VuQk1j9W', 2, 4),
(29, 'Eugenio Falabella', 'testClient_1@gmail.com', '$2b$10$uebenrFD3EUmnAt7eyWRNeYCxyVXpStURQoKLQcuEJWjPUNdiLcRW', 2, 4),
(30, 'Eugenio Falabella', 'testClient_1@gmail.com', '$2b$10$3HwMRNVK0pUYB2.li0WxWuTRP7taaMB71dU3p.nMbntFIrXtjgE7.', 1, NULL),
(31, 'Eugenio Falabella', 'testClient_1@gmail.com', '$2b$10$Cgrg68xvUOaqqhXGeR0MFuPQsItQzc8EMrXbbZ9Qz4OqsW2H5/sYq', 1, NULL),
(32, 'Eugenio Falabella', 'testClient_1@gmail.com', '$2b$10$J88UTPnsvcnLnbHQoFE24.j7WnYq4ajakcyF15W40fZ337VrRFb5S', 1, NULL),
(33, 'joko', 'testClient_1@gmail.com', '$2b$10$qMwWF2CBaOQ99uM.Adc47u.psrOs7Y6pM4brWzEhiqfGokpKnuMMy', 2, 4),
(34, 'joko', 'testClient_1@gmail.com', '$2b$10$tWAvfQD/iiULJzBhXDwv4.joP4b4fKoO4sDZvhZnA3nwvQaYFrXzO', 2, 4),
(35, 'joko', 'testClient_1@gmail.com', '$2b$10$szmvx67s1oZaTGNg88cjJOV7NPb.A0JDZFKO8WQC3oaRDSbFpQnga', 2, 4),
(36, 'joko', 'testClient_1@gmail.com', '$2b$10$.7AuoFvU1cyQ4c0Pheh/Sud7Z5DPLw/eLOqrS4yr2jBtH0ySnxD06', 2, 4),
(37, 'joko', 'testClient_1@gmail.com', '$2b$10$sNA5elslwro0w2Be9ZxQr.XqlyVI/6lyiLEZrEvSkOlYqQHJKxtNS', 2, 4),
(38, 'joko', 'testClient_1@gmail.com', '$2b$10$vOiduhWr1hpXqZI5TQ2UJO.54CVrcNeFJq93828nRP7vNf4d4wB3G', 2, 4),
(39, 'dd', 'ee@gmail.com', '$2b$10$FtUs/XSRfJXWBvWtqVyMluj3quT3h7AqZTYGdXqpx56FbF2cGnC6q', 2, 4),
(40, 'joko', 'e@gmail.com', '$2b$10$gDrYWXpuUhhMUNZ5KrHkQ.a.c/6gwdbS06dGrOsKndgn49xQ29qGu', 2, 4),
(41, 'locos', 'locos@gmail.com', '$2b$10$DMEqPmtvuaxUQSHk/Tog8OzQIqz4Ik.dJUV2cZiymLq9vhFRFnxwi', 2, 1),
(42, 'joko', 'falabellaeuge@gmail.com', '$2b$10$g1.IhGdt7P0Q7msdRkCwpu/LB0NHt3Uoa2lwsDkydjcxWHxuOHbfy', 2, 1),
(43, 'locos', 'locos@gmail.com', '$2b$10$IVKAJnQxC6BwIlU1Fbvky.QJXUqDQ/GGS7njNEjgOGk.JoFBi3xz.', 1, NULL),
(44, 'joko', 'eugeniofalabella@gmail.com', '$2b$10$IgT2QfwixXjFoRy.T3NKPefSS2QCAA9jMeqQpGXawmC2mtpBIldf6', 2, 1),
(45, 'ss', 'eugeniofalabella@gmail.com', '$2b$10$Ygz6cXy6h8wFRtGwuvvXpOIxeKMykzMjwVyMwzhk.I9alvOeCehjm', 1, NULL),
(46, 'aa', 'eugeniofalabella@gmail.com', '$2b$10$mVXyfIDdQ7WeOTcGkMbv1eIhO5z0Jq3tNtWYh4.vAs8HtRwlsy54C', 1, NULL),
(47, 'joko', 'eugeniofalabella@gmail.com', '$2b$10$6/SLvrZC8ztXbgWMYrkzwOeyJSw/7OwWSo8XMD/uNImiILRpbtUPq', 1, NULL),
(48, 'euge', 'eugeniofalabella@gmail.com', '$2b$10$j8wptIEPcCDUItcv2Ii.n.2jL2cj.Z60pLN8EAuKv5jqzvhjVd8wa', 1, NULL),
(49, 'euge', 'olo@gmail.com', '$2b$10$j8wptIEPcCDUItcv2Ii.n.2jL2cj.Z60pLN8EAuKv5jqzvhjVd8wa', 1, NULL),
(50, 'dd', 'ooo@yahoo.com', '$2b$10$H..bLQcW76YNzqGo.I90fOp01Tpj34Q152cSebUrD6r5Ntg6hri02', 1, NULL),
(51, 'VAMOS', 'porfin@porfin.com', '$2a$10$2Hr2wD.DZ2qy4SWEpHdNX.8B0anRfRV7SU05RJAe8B5R2uST3mY7W', 1, NULL),
(52, 'ddd', 'eee', '$2a$10$totXre3d5kmxMtHYURyQtuMyDfuT1EwTxn8s8oJ2ZV0KvWgprOY/.', 2, 51);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `client_admins`
--

CREATE TABLE `client_admins` (
  `client_id` int NOT NULL,
  `admin_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dashboards`
--

CREATE TABLE `dashboards` (
  `dashboard_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `client_id` int DEFAULT NULL,
  `additional_client_ids` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entities`
--

CREATE TABLE `entities` (
  `entity_id` int NOT NULL,
  `client_id` int DEFAULT NULL,
  `disp_name` varchar(255) DEFAULT NULL,
  `sub_topic` varchar(255) DEFAULT NULL,
  `pub_topic` varchar(255) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `datasource_type` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `datasource_config` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `entities`
--

INSERT INTO `entities` (`entity_id`, `client_id`, `disp_name`, `sub_topic`, `pub_topic`, `token`, `datasource_type`, `datasource_config`) VALUES
(195, NULL, 'hsofk', 'clip9', 'clip9', '', '', 'null'),
(196, NULL, 'logi', 'ppoppww', 'poopww', '', '', 'null'),
(197, NULL, 's', 's', 's', '', '', 'null'),
(198, NULL, 'prueba 1', 'ppoppww987', 'ppoppww987', 'cd554cc73a9228bcae1e40e534a79472', '', 'null'),
(199, NULL, 'prueba_token', 'ppoppww987', 'ppoppww987', 'd5d0e9e8daa9acfd63830f0471a82340', '', 'null'),
(200, NULL, 'prueba_token', 'pop', 'pop', '295e34d626931c651ba307ecdff3abf3', '', 'null'),
(201, NULL, 'prueba_tokeee', 'lol', 'ded', '59865971f47432045232b752a33c86b5', '', 'null'),
(202, 4, 'token_prueba', 'ppoppww98', 'ppoppww987', '890a4250a9c27ac3877d3af785919ff6', 'MQTT', '{}'),
(203, 14, 'termostato', 'comando_cocina', 'temp_cocina', '35e3e8c11e3f03522a53e90680c9b504', '', 'null'),
(212, 4, 'WemosDS_18B20', 'compuPc', 'habitacionPa/Comandos', 'a35cb016f2f2375e07996e719268a922', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial`
--

CREATE TABLE `historial` (
  `historic_id` int NOT NULL,
  `entity_id` int DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `data` json DEFAULT NULL,
  `client_id` int NOT NULL,
  `selected_key` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int NOT NULL,
  `client_id` int DEFAULT NULL,
  `alarm_id` int DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `data` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `visto` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `otp_tokens`
--

CREATE TABLE `otp_tokens` (
  `id` int NOT NULL,
  `client_id` int NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `widgets`
--

CREATE TABLE `widgets` (
  `widget_id` int NOT NULL,
  `entity_id` int DEFAULT NULL,
  `dashboard_id` int DEFAULT NULL,
  `widget_type` varchar(100) DEFAULT NULL,
  `config_data` json DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `widget_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `widgets`
--

INSERT INTO `widgets` (`widget_id`, `entity_id`, `dashboard_id`, `widget_type`, `config_data`, `client_id`, `widget_name`) VALUES
(112, 202, 8790, 'lineChart', '{\"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'medidor prueba token'),
(113, NULL, 8790, 'lineChart', '{\"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww987\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'prueba_token'),
(114, 203, 8792, 'lineChart', '{\"pub_topic\": \"temp_cocina\", \"sub_topic\": \"comando_cocina\", \"entity_name\": \"termostato\", \"selected_key\": \"temp\"}', 14, 'tmperatura cocina'),
(115, NULL, 8790, 'lineChart', '{\"pub_topic\": \"fiebre\", \"sub_topic\": \"fiebre/ppoppww\", \"entity_name\": \"termometro frente\", \"selected_key\": \"msg\"}', 4, 'rf'),
(116, NULL, 8791, 'lineChart', '{\"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'temp'),
(117, NULL, 8791, 'lineChart', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'Line test'),
(125, NULL, 8791, 'lineChart', '{\"lineColor\": \"#654b4b\", \"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'LineChart'),
(128, NULL, 8807, 'map', '{\"lat\": \"33\", \"lon\": \"33\", \"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'MAPA'),
(129, NULL, 8791, 'map', '{\"lat\": \"1\", \"lon\": \"1\", \"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'Mapa arg'),
(136, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"hola\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'script.0'),
(137, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<b>ipsum</b>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'script.1'),
(138, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'script.2'),
(139, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<b>script.33</b>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'script.3'),
(140, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<img src=\\\"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ_8tSMoXJp_d9-slzi6ptNkK2LLTBs0aFIg&s\\\">Imagen</img>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'script.4'),
(141, NULL, 8809, 'lineChart', '{\"lineColor\": \"#ff00fc\", \"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'termometro'),
(142, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<img src=\\\"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ_8tSMoXJp_d9-slzi6ptNkK2LLTBs0aFIg&s\\\"/>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'grau trucho'),
(143, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"scriptCss\": \".card {\\n    width: 100%;\\n    height: 100%;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}\\n\\n\\n\\n\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"<div class=\\\"card\\\">\\n    <div id=\\\"aspas\\\">\\n    </div>    \\n</div>\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(${Bebedero});\\n // Replace with the actual value e.g., ${Bebedero}\\nfunction updateValue(value) {\\n    var element = document.getElementById(\'aspas\');\\n    let lastRotation = 0;    \\n    let rotationInterval = 100;\\n    let rotationIncrement = 50;\\n var clickSound = new Audio(\'http://www.sonidosmp3gratis.com/sounds/vientoencampo.mp3\'); // Reemplaza con la URL del archivo de sonido\\n    if (value === true) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value === false) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n                lastRotation += rotationIncrement;\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value === false) {\\n        // Rotar solo una vez cuando value es false\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n        rotateElement(); // Inicia la rotación normalmente\\n    }\\n}\\n</script>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'aspas'),
(144, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"scriptCss\": \"        .mqtt-card {\\n            display: flex;\\n            flex-direction: column;\\n            align-items: center;\\n            justify-content: center;\\n            width: 300px;\\n            height: 200px;\\n            border-radius: 10px;\\n            background-color: #ffffff;\\n            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\\n            padding: 20px;\\n            text-align: center;\\n            font-family: Arial, sans-serif;\\n            transition: background-color 0.3s;\\n        }\\n\\n        /* Estilo del valor */\\n        .mqtt-value {\\n            font-size: 2em;\\n            color: #232939;\\n            margin: 10px 0;\\n        }\\n\\n        /* Color de fondo para diferentes valores */\\n        .mqtt-card.high {\\n            background-color: #f8d7da;\\n        }\\n\\n        .mqtt-card.low {\\n            background-color: #d4edda;\\n        }\\n\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<div id=\\\"mqttCard\\\" class=\\\"mqtt-card\\\">\\n        <h2>Estado Actual</h2>\\n        <div id=\\\"mqttValue\\\" class=\\\"mqtt-value\\\">0</div>\\n    </div>\\n\\n    <script>\\n        // Función para actualizar el valor y estilo en la tarjeta\\n        function updateCard(value) {\\n            const mqttValue = document.getElementById(\\\"mqttValue\\\");\\n            const mqttCard = document.getElementById(\\\"mqttCard\\\");\\n\\n            // Actualizar el valor mostrado\\n            mqttValue.textContent = value;\\n\\n            // Cambiar color de fondo basado en el valor recibido\\n            if (value > 50) {\\n                mqttCard.classList.add(\\\"high\\\");\\n                mqttCard.classList.remove(\\\"low\\\");\\n            } else {\\n                mqttCard.classList.add(\\\"low\\\");\\n                mqttCard.classList.remove(\\\"high\\\");\\n            }\\n        }\\n\\n        // Simulación de la suscripción a un valor de MQTT (reemplazar con MQTT real)\\n        let value = 0;\\n        setInterval(() => {\\n            value = Math.floor(Math.random() * 100); // Simula cambios en el valor\\n            updateCard(value); // Llamar a la función de actualización\\n        }, 3000);\\n\\n        // Integración real: recibir valor desde MQTT y llamar a `updateCard(value);`\\n    </script>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'prueba'),
(145, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"scriptCss\": \" .mqtt-card {\\n            display: flex;\\n            flex-direction: column;\\n            align-items: center;\\n            justify-content: center;\\n            width: 300px;\\n            height: 200px;\\n            border-radius: 10px;\\n            background-color: #ffffff;\\n            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\\n            padding: 20px;\\n            text-align: center;\\n            font-family: Arial, sans-serif;\\n            transition: background-color 0.3s;\\n        }\\n\\n        /* Estilo del valor */\\n        .mqtt-value {\\n            font-size: 2em;\\n            color: #232939;\\n            margin: 10px 0;\\n        }\\n\\n        /* Color de fondo para diferentes valores */\\n        .mqtt-card.high {\\n            background-color: #f8d7da;\\n        }\\n\\n        .mqtt-card.low {\\n            background-color: #d4edda;\\n        }\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"    <div id=\\\"mqttCard\\\" class=\\\"mqtt-card\\\">\\n        <h2>Estado Actual</h2>\\n        <div id=\\\"mqttValue\\\" class=\\\"mqtt-value\\\">0</div>\\n    </div>\\n\\n    <script>\\n        // Asigna el valor de MQTT a la variable `value`\\n        // Función para actualizar el valor y estilo en la tarjeta\\n        function updateCard() {\\n            const mqttValue = document.getElementById(\\\"mqttValue\\\");\\n            const mqttCard = document.getElementById(\\\"mqttCard\\\");\\n\\n            // Actualizar el valor mostrado\\n            mqttValue.textContent = value;\\n\\n            // Cambiar color de fondo basado en el valor recibido\\n            if (value > 50) {\\n                mqttCard.classList.add(\\\"high\\\");\\n                mqttCard.classList.remove(\\\"low\\\");\\n            } else {\\n                mqttCard.classList.add(\\\"low\\\");\\n                mqttCard.classList.remove(\\\"high\\\");\\n            }\\n        }\\n\\n        // Llama a updateCard para reflejar el valor inicial\\n        updateCard();\\n\\n        // Escucha cambios en `value` y actualiza la tarjeta\\n        // Simulando un cambio en `value` (elimina esto en tu implementación final)\\n\\n        // Cuando `value` cambie en tu sistema real, llama `updateCard()` para actualizar la tarjeta.\\n    </script>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'prueba 2'),
(146, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"    <div>\\n        <h3>Estado Actual</h3>\\n        <p>El valor actual es: <strong id=\\\"injectedValue\\\">${value}</strong></p>\\n        <p>¡Gracias por usar nuestro widget!</p>\\n    </div>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'prueba 3'),
(147, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"scriptCss\": \".card {\\n    width: 100%;\\n    height: 100%;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<div class=\\\"card\\\">\\n    <div id=\\\"aspas\\\">\\n    </div>    \\n</div>\\n\\n\\n\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(${value});\\n\\n // Replace with the actual value e.g., ${Bebedero}\\n\\n\\nfunction updateValue(value) {\\n \\n    if (value == 23) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value == 24) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n    \\n    \\n\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n\\n                lastRotation += rotationIncrement;\\n\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value === false) {\\n        // Rotar solo una vez cuando value es false\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n        rotateElement(); // Inicia la rotación normalmente\\n    }\\n}\\n</script>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'prueba 5?'),
(149, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<div class=\\\"card\\\">\\n\\n    <div id=\\\"aspas\\\">\\n\\n    </div>    \\n\\n\\n\\n\\n</div>\\n\\n\\n\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(${value});\\n\\n\\n\\n\\nfunction updateValue(value) {\\n    var element = document.getElementById(\'aspas\');\\n    let lastRotation = 0;    \\n    let rotationInterval = 100;\\n    let rotationIncrement = 50;\\n var clickSound = new Audio(\'http://www.sonidosmp3gratis.com/sounds/vientoencampo.mp3\'); // Reemplaza con la URL del archivo de sonido\\n\\n    if (value == 23) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value === 24) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n    \\n    \\n\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n\\n                lastRotation += rotationIncrement;\\n\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value === 24) {\\n        // Rotar solo una vez cuando value es false\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n        rotateElement(); // Inicia la rotación normalmente\\n    }\\n}\\n</script>\\n<style>\\n.card {\\n    width: 100%;\\n    height: 100%;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}\\n</style>\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'prueba 7'),
(150, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'dd'),
(151, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"<div class=\\\"card\\\">\\n\\n    <div id=\\\"aspas\\\">\\n\\n    </div>    \\n\\n\\n\\n\\n</div>\\n\\n\\n\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(${value});\\n\\n // Replace with the actual value e.g., ${Bebedero}\\n\\n\\nfunction updateValue(value) {\\n    var element = document.getElementById(\'aspas\');\\n    let lastRotation = 0;    \\n    let rotationInterval = 100;\\n    let rotationIncrement = 50;\\n var clickSound = new Audio(\'http://www.sonidosmp3gratis.com/sounds/vientoencampo.mp3\'); // Reemplaza con la URL del archivo de sonido\\n\\n    if (value == 24) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value == 23) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n    \\n    \\n\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n\\n                lastRotation += rotationIncrement;\\n\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value == 23) {\\n        // Rotar solo una vez cuando value es false\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n        rotateElement(); // Inicia la rotación normalmente\\n    }\\n}\\n</script>\\n<style>.card {\\n    width: 100%;\\n    height: 150px;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}</style>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'prueba 8'),
(152, NULL, 8790, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"scriptCss\": \"/* Reset básico para márgenes y padding */\\n* {\\n    margin: 0;\\n    padding: 0;\\n    box-sizing: border-box;\\n}\\n\\n/* Estilo para el body */\\nbody {\\n    font-family: \'Arial\', sans-serif;\\n    background-color: #f0f0f0;\\n    display: flex;\\n    justify-content: center;\\n    align-items: center;\\n    height: 100vh;\\n    margin: 0;\\n}\\n\\n/* Estilo de la tarjeta */\\n.card {\\n    background-color: #ffffff;\\n    border-radius: 12px;\\n    width: 400px;\\n    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);\\n    overflow: hidden;\\n    display: flex;\\n    flex-direction: column;\\n    border: 1px solid #e0e0e0;\\n}\\n\\n/* Cabecera de la tarjeta (avatar, nombre, título y ubicación) */\\n.card-header {\\n    display: flex;\\n    align-items: center;\\n    padding: 20px;\\n    background-color: #232939;\\n    color: #fff;\\n}\\n\\n.card-avatar {\\n    margin-right: 15px;\\n}\\n\\n.avatar {\\n    width: 80px;\\n    height: 80px;\\n    border-radius: 50%;\\n    object-fit: cover;\\n}\\n\\n.card-info {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: center;\\n}\\n\\n.card-name {\\n    font-size: 22px;\\n    font-weight: bold;\\n}\\n\\n.card-title, .card-location {\\n    font-size: 14px;\\n    color: #ddd;\\n}\\n\\n/* Cuerpo de la tarjeta */\\n.card-body {\\n    padding: 20px;\\n    background-color: #fafafa;\\n}\\n\\n/* Estadísticas (proyectos, seguidores, rating) */\\n.card-stats {\\n    display: flex;\\n    justify-content: space-between;\\n    margin-bottom: 20px;\\n}\\n\\n.stat {\\n    text-align: center;\\n}\\n\\n.stat-label {\\n    font-size: 14px;\\n    color: #666;\\n}\\n\\n.stat-value {\\n    font-size: 18px;\\n    font-weight: bold;\\n    color: #232939;\\n}\\n\\n.star {\\n    color: #ff6a00;\\n    font-size: 16px;\\n}\\n\\n/* Biografía */\\n.card-bio {\\n    font-size: 16px;\\n    color: #333;\\n    margin-bottom: 20px;\\n}\\n\\n/* Botones de acción */\\n.card-actions {\\n    display: flex;\\n    justify-content: space-between;\\n}\\n\\n.btn {\\n    padding: 10px 20px;\\n    font-size: 14px;\\n    border: none;\\n    border-radius: 5px;\\n    cursor: pointer;\\n    width: 30%;\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    transition: all 0.3s ease;\\n}\\n\\n.primary-btn {\\n    background-color: #ff6a00;\\n    color: white;\\n}\\n\\n.primary-btn:hover {\\n    background-color: #ff4500;\\n}\\n\\n.secondary-btn {\\n    background-color: #232939;\\n    color: white;\\n}\\n\\n.secondary-btn:hover {\\n    background-color: #444c56;\\n}\\n\\n.tertiary-btn {\\n    background-color: #e0e0e0;\\n    color: #232939;\\n}\\n\\n.tertiary-btn:hover {\\n    background-color: #ccc;\\n}\\n\\n/* Pie de la tarjeta */\\n.card-footer {\\n    background-color: #f4f4f4;\\n    padding: 10px 20px;\\n    text-align: center;\\n}\\n\\n.card-socials {\\n    display: flex;\\n    justify-content: center;\\n}\\n\\n.social-link {\\n    font-size: 20px;\\n    margin: 0 10px;\\n    color: #333;\\n    transition: color 0.3s ease;\\n}\\n\\n.social-link:hover {\\n    color: #ff6a00;\\n}\\n\\n/* Estilos para los íconos (FontAwesome) */\\n.fab, .fas {\\n    margin-right: 8px;\\n}\\n\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<div class=\\\"card\\\">\\n    <div class=\\\"card-header\\\">\\n        <div class=\\\"card-avatar\\\">\\n            <img src=\\\"https://via.placeholder.com/150\\\" alt=\\\"Imagen de perfil\\\" class=\\\"avatar\\\">\\n        </div>\\n        <div class=\\\"card-info\\\">\\n            <h2 class=\\\"card-name\\\">Nombre del Usuario</h2>\\n            <p class=\\\"card-title\\\">Desarrollador Frontend</p>\\n            <p class=\\\"card-location\\\">Ciudad, País</p>\\n        </div>\\n    </div>\\n\\n    <div class=\\\"card-body\\\">\\n        <div class=\\\"card-stats\\\">\\n            <div class=\\\"stat\\\">\\n                <p class=\\\"stat-label\\\">Proyectos Completados</p>\\n                <p class=\\\"stat-value\\\">45</p>\\n            </div>\\n            <div class=\\\"stat\\\">\\n                <p class=\\\"stat-label\\\">Seguidores</p>\\n                <p class=\\\"stat-value\\\">1500</p>\\n            </div>\\n            <div class=\\\"stat\\\">\\n                <p class=\\\"stat-label\\\">Rating</p>\\n                <p class=\\\"stat-value\\\">4.8 <span class=\\\"star\\\">&#9733;</span></p>\\n            </div>\\n        </div>\\n\\n        <p class=\\\"card-bio\\\">\\n            Apasionado por el desarrollo web y la creación de experiencias interactivas. Siempre en busca de nuevos desafíos y oportunidades para aprender.\\n        </p>\\n\\n        <div class=\\\"card-actions\\\">\\n            <button class=\\\"btn primary-btn\\\"><i class=\\\"fas fa-user-plus\\\"></i> Seguir</button>\\n            <button class=\\\"btn secondary-btn\\\"><i class=\\\"fas fa-envelope\\\"></i> Mensaje</button>\\n            <button class=\\\"btn tertiary-btn\\\"><i class=\\\"fas fa-ellipsis-h\\\"></i> Más</button>\\n        </div>\\n    </div>\\n\\n    <div class=\\\"card-footer\\\">\\n        <div class=\\\"card-socials\\\">\\n            <a href=\\\"#\\\" class=\\\"social-link\\\"><i class=\\\"fab fa-twitter\\\"></i></a>\\n            <a href=\\\"#\\\" class=\\\"social-link\\\"><i class=\\\"fab fa-linkedin\\\"></i></a>\\n            <a href=\\\"#\\\" class=\\\"social-link\\\"><i class=\\\"fab fa-github\\\"></i></a>\\n        </div>\\n    </div>\\n</div>\\n\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'Html prueba'),
(153, NULL, 8790, 'customValueCard', '{\"pub_topic\": \"ppoppww\", \"scriptCss\": \".widget-container {\\n  background-color: #232939; /* Fondo oscuro */\\n  color: #ffffff; /* Texto blanco */\\n  border-radius: 8px;\\n  padding: 20px;\\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\\n  text-align: center;\\n  max-width: 300px;\\n  margin: auto;\\n}\\n\\n.title {\\n  font-size: 30px;\\n  font-weight: bold;\\n  margin-bottom: 10px;\\n}\\n\\n.description {\\n  font-size: 16px;\\n  margin-bottom: 20px;\\n}\\n\\n.action-button {\\n  background-color: #ff5722; /* Color de botón */\\n  color: #ffffff;\\n  border: none;\\n  border-radius: 4px;\\n  padding: 10px 20px;\\n  font-size: 14px;\\n  cursor: pointer;\\n  transition: background-color 0.3s ease;\\n}\\n\\n.action-button:hover {\\n  background-color: #e64a19; /* Color al pasar el mouse */\\n}\\n\", \"sub_topic\": \"ppoppww\", \"scriptHtml\": \"<div class=\\\"widget-container\\\">\\n  <h1 class=\\\"title\\\">¡GG!</h1>\\n  <p class=\\\"description\\\">Este es un widget HTML.</p>\\n  <button class=\\\"action-button\\\">Pulse Aqui</button>\\n</div>\\n\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'GG name 3.1'),
(154, NULL, NULL, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"      <div className=\\\"widget-custom-value-card\\\">\\n        <h2>Widget Custom Value Card</h2>\\n        <p>${value}</p>\\n      </div>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'Intento Edicion'),
(155, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"scriptCss\": \"    .image-container {\\n      width: 200px;\\n      height: 200px;\\n      background-size: cover;\\n      background-position: center;\\n      border: 1px solid #ccc;\\n    }\\n    .greater-than-25 {\\n      background-image: url(\'https://cdn.icon-icons.com/icons2/728/PNG/512/thermometer_heat_temperature_summer_icon-icons.com_62708.png\');\\n    }\\n    /* Imagen para valores < 25 */\\n    .less-than-25 {\\n      background-image: url(\'https://cdn-icons-png.flaticon.com/512/1247/1247790.png\');\\n    }\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"  <div id=\\\"image-container\\\" class=\\\"image-container\\\"></div>\\n  <script>\\n    const container = document.getElementById(\'image-container\');\\n    if (${value} > 25) {\\n      container.classList.add(\'greater-than-25\');\\n    } else {\\n      container.classList.add(\'less-than-25\');\\n    }\\n  </script>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'Intento Imagen Cambio'),
(156, NULL, 8809, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"scriptCss\": \".card {\\n    width: 100%;\\n    height: 150px;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"<div class=\\\"card\\\" bis_skin_checked=\\\"1\\\">\\n\\n    <div id=\\\"aspas\\\" bis_skin_checked=\\\"1\\\">\\n\\n    </div>    \\n\\n\\n\\n\\n</div>\\n\\nHOLAAA\\n\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(${value});\\n\\n\\nfunction updateValue(value) {\\n    var element = document.getElementById(\'aspas\');\\n    let lastRotation = 0;    \\n    let rotationInterval = 100;\\n    let rotationIncrement = 50;\\n var clickSound = new Audio(\'http://www.sonidosmp3gratis.com/sounds/vientoencampo.mp3\'); // Reemplaza con la URL del archivo de sonido\\n\\n    if (value == 24) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value == 23) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n    \\n    \\n\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n\\n                lastRotation += rotationIncrement;\\n\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value == 23) {\\n        // Rotar solo una vez cuando value es false\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n        rotateElement(); // Inicia la rotación normalmente\\n    }\\n}\\n</script>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'prrrrr'),
(157, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"scriptCss\": \".card {\\n    width: 100%;\\n    height: 150px;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"<div class=\\\"card\\\" bis_skin_checked=\\\"1\\\">\\n\\n    <div id=\\\"aspas\\\" bis_skin_checked=\\\"1\\\">\\n\\n    </div>    \\n\\n\\n\\n\\n</div>\\n\\n\\n\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(${value});\\n\\n // Replace with the actual value e.g., ${Bebedero}\\nfunction updateValue(value) {\\nconsole.log(value);\\n    var element = document.getElementById(\'aspas\');\\n    let lastRotation = 0;    \\n    let rotationInterval = 100;\\n    let rotationIncrement = 50;\\n var clickSound = new Audio(\'http://www.sonidosmp3gratis.com/sounds/vientoencampo.mp3\'); // Reemplaza con la URL del archivo de sonido\\n\\n    if (value >= 24) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value < 24) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n    \\n    \\n\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n\\n                lastRotation += rotationIncrement;\\n\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value == 23) {\\n        // Rotar solo una vez cuando value es false\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n        rotateElement(); // Inicia la rotación normalmente\\n    }\\n}\\n</script>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'script.5'),
(158, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"scriptCss\": \".card {\\n    width: 100%;\\n    height: 150px;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"<div class=\\\"card\\\" bis_skin_checked=\\\"1\\\">\\n\\n    <div id=\\\"aspas\\\" bis_skin_checked=\\\"1\\\">\\n\\n    </div>    \\n\\n\\n\\n\\n</div>\\n\\n\\n\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(${value});\\n\\n // Replace with the actual value e.g., ${Bebedero}\\n\\n\\nfunction updateValue(value) {\\n    var element = document.getElementById(\'aspas\');\\n    let lastRotation = 0;    \\n    let rotationInterval = 100;\\n    let rotationIncrement = 50;\\n var clickSound = new Audio(\'http://www.sonidosmp3gratis.com/sounds/vientoencampo.mp3\'); // Reemplaza con la URL del archivo de sonido\\n\\n    if (value == 24) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value == 23) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n    \\n    \\n\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n\\n                lastRotation += rotationIncrement;\\n\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value < 23) {\\n        // Rotar solo una vez cuando value es false\\n            console.log(\\\"quietooooo......\\\")\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n    console.log(\\\"rotandoooooo......\\\")\\n        rotateElement();\\n    }\\n}\\n</script>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'script.6'),
(159, NULL, 8808, 'customValueCard', '{\"pub_topic\": \"ppoppww987\", \"scriptCss\": \".card {\\n    width: 100%;\\n    height: 150px;\\n    border: 2px solid #ccc;\\n    box-sizing: border-box;\\n\\n}\\n\\n.card .content {\\n    padding: 20px;\\n    display: flex;\\n    flex-direction: row;\\n    align-items: center;\\n    justify-content: space-around;\\n    height: 100%;\\n    box-sizing: border-box;\\n}\\n\\n.card .content .column {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-around;\\n    height: 100%;\\n}\\n\\n.card h1 {\\n    text-transform: uppercase;\\n    color: #999;\\n    font-size: 20px;\\n    font-weight: bold;\\n    margin: 0;\\n    padding-bottom: 10px;\\n    line-height: 32px;\\n}\\n\\n.card .value {\\n    font-size: 38px;\\n    font-weight: 200;\\n}\\n\\n.card .description {\\n    font-size: 20px;\\n    color: #999;\\n}\\n\\n#aspas {\\n    width: 100%; /* Ajuste al ancho del contenedor .card */\\n    height: 100%; /* Ajuste a la altura del contenedor .card */\\n    background-image: url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\');\\n    background-size: contain; /* Ajustar para contener la imagen dentro del contenedor sin recortar */\\n    background-repeat: no-repeat; /* Evitar la repetición de la imagen */\\n    background-position: center; /* Posicionar la imagen en el centro del contenedor */\\n    transition: transform 0.5s linear;\\n}\", \"sub_topic\": \"ppoppww98\", \"scriptHtml\": \"<div class=\\\"card\\\" bis_skin_checked=\\\"1\\\">\\n\\n    <div id=\\\"aspas\\\" style=\\\"background-image: url(&quot;https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png&quot;); transform: rotate(55700deg);\\\" bis_skin_checked=\\\"1\\\">\\n\\n    </div>    \\n\\n\\n\\n\\n</div>\\n\\n\\n\\n<script>\\n    // Example logic to update the value based on received data\\n    updateValue(true);\\n\\n // Replace with the actual value e.g., true\\n\\n\\nfunction updateValue(value) {\\n    var element = document.getElementById(\'aspas\');\\n    let lastRotation = 0;    \\n    let rotationInterval = 100;\\n    let rotationIncrement = 50;\\n var clickSound = new Audio(\'http://www.sonidosmp3gratis.com/sounds/vientoencampo.mp3\'); // Reemplaza con la URL del archivo de sonido\\n\\n    if (value === true) {\\n        element.style.backgroundImage = \\\"url(\'https://png.pngtree.com/png-clipart/20230823/original/pngtree-fan-blades-rotate-motor-powered-icon-picture-image_8196513.png\')\\\";\\n        clickSound.play();\\n        setTimeout(function() {\\n            clickSound.pause(); // Pausa el sonido después de 2 segundos\\n            clickSound.currentTime = 0; // Reinicia el sonido al principio\\n        }, 2000);\\n    } else if (value === false) {\\n        element.style.backgroundImage = \\\"url(\'https://i.imgur.com/8Een4OY.png\')\\\";\\n    } else {\\n        element.style.backgroundImage = \\\"url(\'https://t4.ftcdn.net/jpg/00/72/62/07/360_F_72620788_xyHpyEV0OFROwiYoL5sz0Roj2b2GHr25.jpg\')\\\";\\n    }\\n    \\n    \\n\\n        function rotateElement() {\\n        if (value) {\\n            lastRotation += rotationIncrement;\\n            element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n            setTimeout(rotateElement, rotationInterval);\\n        } else {\\n            lastRotation*=0.4\\n            rotationIncrement =100; // Cambiar el incremento a 5 grados\\n            if (lastRotation < 360) { // Evitar rotaciones infinitas}\\n\\n                lastRotation += rotationIncrement;\\n\\n                element.style.transform = \'rotate(\' + lastRotation + \'deg)\';\\n                setTimeout(rotateElement, rotationInterval);\\n            }\\n        }\\n    }\\n\\n    if (value === false) {\\n        // Rotar solo una vez cuando value es false\\n        setTimeout(rotateElement, 0); // Llama a rotateElement inmediatamente después\\n    } else {\\n        rotateElement(); // Inicia la rotación normalmente\\n    }\\n}\\n</script>\", \"entity_name\": \"token_prueba\", \"selected_key\": \"msg\"}', 4, 'script.7'),
(160, NULL, 8790, 'barChart', '{\"lineColor\": \"#00ff1c\", \"pub_topic\": \"ppoppww\", \"sub_topic\": \"ppoppww\", \"entity_name\": \"wesmos\", \"selected_key\": \"msg\"}', 4, 'temperatura'),
(161, NULL, 8807, 'lineChart', '{\"pub_topic\": \"ppoppww987\", \"sub_topic\": \"ppoppww98\", \"entity_name\": \"token_prueba\", \"selected_key\": \"grgr\"}', 4, 'grgr');
INSERT INTO `widgets` (`widget_id`, `entity_id`, `dashboard_id`, `widget_type`, `config_data`, `client_id`, `widget_name`) VALUES
(167, 212, 8814, 'customValueCard', '{\"pub_topic\": \"habitacionPa/Comandos\", \"scriptCss\": \"        .widget-contacto-seco {\\n            display: flex;\\n            align-items: center;\\n            gap: 10px;\\n            font-family: Arial, sans-serif;\\n        }\\n\\n        .light-bulb {\\n            width: 24px;\\n            height: 24px;\\n            border-radius: 50%;\\n            background-color: var(--light-off-color, #ddd); /* Color de luz apagada por defecto */\\n            transition: background-color 0.3s ease-in-out;\\n        }\\n\\n        .light-bulb.on {\\n            background-color: var(--light-on-color, #4caf50); /* Color de luz encendida */\\n        }\\n\\n        .light-bulb.off {\\n            background-color: var(--light-off-color, #ddd); /* Color de luz apagada */\\n        }\\n\\n        .label {\\n            font-size: 16px;\\n            color: #333;\\n        }\\n\", \"sub_topic\": \"compuPc\", \"scriptHtml\": \"  <div class=\\\"widget-contacto-seco\\\">\\n        <div class=\\\"light-bulb off\\\" id=\\\"light-bulb\\\"></div>\\n        <span class=\\\"label\\\">Contacto Seco</span>\\n    </div>\\n\\n    <script>\\n        const lightOnColor = \'#4caf50\';  // Color de la luz encendida\\n        const lightOffColor = \'#ddd\';     // Color de la luz apagada\\n\\n        // Simulación del estado recibido (cambiar este valor según las condiciones externas)\\n        let isActive = ${value};  // Cambia a true o false según el estado\\n\\n        const bulbElement = document.getElementById(\'light-bulb\');\\n\\n        // Inicializar el estado\\n        bulbElement.className = isActive ? \'light-bulb on\' : \'light-bulb off\';\\n\\n    </script>\\n\", \"entity_name\": \"WemosDS_18B20\", \"selected_key\": \"contactoSeco\"}', 4, 'contactoSeco'),
(168, 212, 8814, 'customValueCard', '{\"pub_topic\": \"habitacionPa/Comandos\", \"scriptCss\": \".\", \"sub_topic\": \"compuPc\", \"scriptHtml\": \"${value}\", \"entity_name\": \"WemosDS_18B20\", \"selected_key\": \"contactoSeco\"}', 4, 'dd'),
(169, 212, 8814, 'customValueCard', '{\"pub_topic\": \"habitacionPa/Comandos\", \"sub_topic\": \"compuPc\", \"scriptHtml\": \"${value}\", \"entity_name\": \"WemosDS_18B20\", \"selected_key\": \"contactoSeco\"}', 4, 'eeee'),
(170, 212, 8814, 'lineChart', '{\"lineColor\": \"#7ba3d7\", \"pub_topic\": \"habitacionPa/Comandos\", \"sub_topic\": \"compuPc\", \"entity_name\": \"WemosDS_18B20\", \"selected_key\": \"temp\"}', 4, 'tempe');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `access_levels`
--
ALTER TABLE `access_levels`
  ADD PRIMARY KEY (`level_id`);

--
-- Indices de la tabla `alarms`
--
ALTER TABLE `alarms`
  ADD PRIMARY KEY (`alarm_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `entity_id` (`entity_id`);

--
-- Indices de la tabla `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`client_id`),
  ADD KEY `access_level_id` (`access_level_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indices de la tabla `client_admins`
--
ALTER TABLE `client_admins`
  ADD PRIMARY KEY (`client_id`,`admin_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indices de la tabla `dashboards`
--
ALTER TABLE `dashboards`
  ADD PRIMARY KEY (`dashboard_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indices de la tabla `entities`
--
ALTER TABLE `entities`
  ADD PRIMARY KEY (`entity_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indices de la tabla `historial`
--
ALTER TABLE `historial`
  ADD PRIMARY KEY (`historic_id`),
  ADD KEY `entity_id` (`entity_id`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `alarm_id` (`alarm_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indices de la tabla `otp_tokens`
--
ALTER TABLE `otp_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indices de la tabla `widgets`
--
ALTER TABLE `widgets`
  ADD PRIMARY KEY (`widget_id`),
  ADD KEY `entity_id` (`entity_id`),
  ADD KEY `dashboard_id` (`dashboard_id`),
  ADD KEY `client_id` (`client_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `access_levels`
--
ALTER TABLE `access_levels`
  MODIFY `level_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `alarms`
--
ALTER TABLE `alarms`
  MODIFY `alarm_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `client_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `dashboards`
--
ALTER TABLE `dashboards`
  MODIFY `dashboard_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `entities`
--
ALTER TABLE `entities`
  MODIFY `entity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=213;

--
-- AUTO_INCREMENT de la tabla `historial`
--
ALTER TABLE `historial`
  MODIFY `historic_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `otp_tokens`
--
ALTER TABLE `otp_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `widgets`
--
ALTER TABLE `widgets`
  MODIFY `widget_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alarms`
--
ALTER TABLE `alarms`
  ADD CONSTRAINT `alarms_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`),
  ADD CONSTRAINT `alarms_ibfk_2` FOREIGN KEY (`entity_id`) REFERENCES `entities` (`entity_id`);

--
-- Filtros para la tabla `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`access_level_id`) REFERENCES `access_levels` (`level_id`),
  ADD CONSTRAINT `clients_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `clients` (`client_id`);

--
-- Filtros para la tabla `client_admins`
--
ALTER TABLE `client_admins`
  ADD CONSTRAINT `client_admins_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`),
  ADD CONSTRAINT `client_admins_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `clients` (`client_id`);

--
-- Filtros para la tabla `dashboards`
--
ALTER TABLE `dashboards`
  ADD CONSTRAINT `dashboards_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`);

--
-- Filtros para la tabla `entities`
--
ALTER TABLE `entities`
  ADD CONSTRAINT `entities_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`);

--
-- Filtros para la tabla `historial`
--
ALTER TABLE `historial`
  ADD CONSTRAINT `historial_ibfk_1` FOREIGN KEY (`entity_id`) REFERENCES `entities` (`entity_id`);

--
-- Filtros para la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`alarm_id`) REFERENCES `alarms` (`alarm_id`),
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`);

--
-- Filtros para la tabla `otp_tokens`
--
ALTER TABLE `otp_tokens`
  ADD CONSTRAINT `otp_tokens_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`);

--
-- Filtros para la tabla `widgets`
--
ALTER TABLE `widgets`
  ADD CONSTRAINT `widgets_ibfk_1` FOREIGN KEY (`entity_id`) REFERENCES `entities` (`entity_id`),
  ADD CONSTRAINT `widgets_ibfk_2` FOREIGN KEY (`dashboard_id`) REFERENCES `dashboards` (`dashboard_id`),
  ADD CONSTRAINT `widgets_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
