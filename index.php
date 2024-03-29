<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="keywords" content="electronic music, amsterdam, robert van heumen, robert van heuman, composer, musician, electronische muziek, componist, musicus, sound, geluid, sound design, geluidsontwerp">
<meta name="description" content="PointCode is a simplified, online version of the audio-visual installation Point-to-Line by Robert van Heumen. PointCode is a work in progress, built in Javascript, Web Audio API and HTML Canvas.">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>west28.nl | PointCode</title>
<link type="text/css" rel="stylesheet" href="PointCode.css">
<script type="text/javascript" src="../inc/west28.js"></script>
</head>
<body>

<?php
$text = array (
	'nl' => array (
	'PuntCode', 
	'Je gaat zo PuntCode ervaren. PuntCode is een soort treinreis. Uit het raam kijkend zie je het landschap voorbij glijden, soms flitsen. Je droomt weg, construeert je eigen verhaal. PuntCode is een treinreis door een abstract landschap. Ga lekker zitten, ontspan en geniet van de reis.', 
	'Zorg ervoor dat het geluidsvolume op je apparaat op een goed niveau staat voordat je de link hieronder klikt. Als er op de volgende pagina niets gebeurt, ververs dan de pagina (meestal met F5). Gebruik een Chrome of Firefox browser op een computer voor de beste ervaring. PuntCode loopt helemaal vanzelf, maar als je meer controle wilt, klik dan op de volgende pagina op het pijltje linksboven om het menu te openen. Op iPad en iPhone moet je de treinreis zelf starten door op de volgende pagina op de \'start\' knop te klikken. ',
	'start PuntCode',
	'PuntCode is een vereenvoudigde, online versie van de audiovisuele installatie/compositie <a href=/Point-to-Line/ target="_blank">Point-to-Line</a> door Robert van Heumen. PuntCode is een werk-in-uitvoering, gebouwd in Javascript, Web Audio API en HTML Canvas. PuntCode is getest en werkt op Mac OS X 10.9.5 met de Safari, Firefox en Chrome browsers, op Android smartphones, iPads en iPhones. Alle feedback is welkom om de installatie te verbeteren. Je kunt contact met ons opnemen via <a href="mailto:point@west28.nl">point-at-west28-nl</a>.',
	'OPGELET! Door wijziging in de manier waarop je browser geluid afspeelt, moet je zodra PuntCode gestart is één keer klikken op een van de vierkantjes.'
    )
	,
	'en' => array (
	'PointCode', 
	'You are about to experience PointCode. PointCode is like a trainride. Looking through the window you see the scenery flowing by, sometimes flashing by. Let your mind wander, construct your own tale. PointCode is a trainride in an abstract landscape. Sit back, relax and enjoy the ride. ', 
	'Before you click the link below, make sure the audio volume on your device is at a good level. Use a Chrome of Firefox browser on a computer for the best experience. If nothing seems to happen when you get to the next page, refresh the page (usually with F5). PointCode runs fully automatic, buf if you are interested in more control, click on the arrow in the left upper corner of the next page to open the menu. On iPad and iPhone you will have to start the trainride yourself by clicking on the \'start\' button on the next page. ',
	'enter PointCode',
	'* PointCode is a simplified, online version of the audio-visual installation <a href=/Point-to-Line/ target="_blank">Point-to-Line</a> by Robert van Heumen. PointCode is a work in progress, built in Javascript, Web Audio API and HTML Canvas. PointCode is tested to work on Mac OS X 10.9.5 with the Safari, Firefox and Chrome browsers, as well as on Android mobile phones, iPads and iPhones. We very much appreciate any feedback, so we can improve the work. We can be contacted at <a href="mailto:point@west28.nl">point-at-west28-nl</a>.',
	'WARNING! Because of changes in the way the browser deals with sound, you need to click once on one of the squares when Pointcode is started.'
	)
);

$lang = 'nl';
if (isset($_GET['lang'])) { $lang = htmlspecialchars($_GET['lang'],ENT_QUOTES); }
?>

<h1 class=inline><?= $text[$lang][0] ?></h1>
<font class=tiny>(
<? if($lang=='en') { echo '<a href="?lang=nl">nederlandse versie</a>'; } 
else { echo '<a href="?lang=en">english version</a>'; } ?>	
)</font>
<br /><br />
<font style="color: red;">
<?= $text[$lang][5] ?>
</font>
<br /><br />
<?= $text[$lang][1] ?>
<br /><br />
<?= $text[$lang][2] ?>
<br /><br /> 
<h2><a href="PointCode.html?version<? echo rand(0,1000) ?>"><?= $text[$lang][3] ?></a></h2>
<br /><br /> 
<img src=/images/PointCode2.jpg>
<br /><br /> 
<?= $text[$lang][4] ?>

</body>
</html>
