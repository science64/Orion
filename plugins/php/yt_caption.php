<?php
#########################
# Get YouTube subtitles #
#########################

require_once __DIR__ . "/bootstrap.php";
if(ALLOW_CORS){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

$CaptionHandle = new \App\CaptionsHandle();
$video_url = $_GET['yt_url'] ?? $_POST['yt_url'] ?? '';
$data = new stdClass();
if(empty($video_url)){
    $data->error = "no url or video ID was received";

}else{
    $cookie_file = __DIR__."/my_yt_cookie_file.txt"; // place your cookie file outside the public directory
    // $CaptionHandle->loginWithCookieFile($cookie_file);
    // Uncomment the line above if you need to log in
    try {
        $caption_url = $CaptionHandle->getSubtitleURL($video_url);
        if ($caption_url) {
            $captions_content = $CaptionHandle->httpRequest($caption_url);
            $captions_content = html_entity_decode($captions_content);
            // Remove XML/HTML from subtitles
            // replacing "<" with " <" is to prevent some words from sticking to another
            $captions_content = str_replace("<", " <", $captions_content);
            $captions_content = strip_tags($captions_content);
            $data->caption = $captions_content;
        } else {
            $data->error = "Unable to get subtitles for $video_url";
        }
    } catch (Exception $e) {
        echo $e->getMessage();
    }

}
echo json_encode($data);