<?php
// exit("disabled");
// If you want to disable this feature, uncomment the line above.


const PRODUCTION = false;
const ALLOW_CORS = true;
if(!PRODUCTION){
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
