<?php
session_start();
session_unset();    // Rimuove tutte le variabili di sessione
session_destroy();  // Distrugge la sessione attuale
header("Location: /pages/login.html"); // Redirect alla login
exit;
