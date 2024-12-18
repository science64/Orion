<?php
namespace App;
use Exception;
class CaptionsHandle
{
    private HttpRequest $HttpRequest;

    public function __construct()
    {
        $this->HttpRequest = new \App\HttpRequest();
        $this->HttpRequest->setUserAgent(USER_AGENT);
    }

    public function loginWithCookieFile($cookie_file_path): void
    {
        $this->HttpRequest->setCookie($cookie_file_path);

    }


    /**
     * Gets the URL of the caption related to the video.
     * This URL will be used to extract the caption.
     * @param string $video_id The video ID or URL for which to obtain the caption URL.
     * @return string
     * @throws Exception HTTP request exception.
     */
    public function getSubtitleURL(string $video_id): string
    {
        $video_id = $this->validVideoID($video_id);
        $video_url = "https://www.youtube.com/watch?v={$video_id}";
        $cnt = $this->httpRequest($video_url);
        preg_match("/{\"captionTracks\":\[{\"baseUrl\":\"(.*?)\"/S", $cnt, $match);
        if (!empty($match[1])) {
            $caption_url = trim($match[1]);
            if (preg_match("/^\/api/", $caption_url)) {
                $caption_url = "https://www.youtube.com{$caption_url}";
            }
            return json_decode('"' . $caption_url . '"');  // important
        }
        return '';
    }


    /**
     * Makes an HTTP request to the given URL and returns the content.
     * @param string $url The URL to request.
     * @return string The content of the URL.
     * @throws Exception If the URL is invalid.
     */
    public function httpRequest(string $url): string
    {
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->HttpRequest->get($url)->body;
        }

        throw new Exception("BAD URL: $url");
    }


    /**
     * Checks if the provided video ID is valid, if it is an url, get the ID from the URL
     * @param string $video_id The YouTube URL or video ID  to be validated.
     * @return string The video ID if valid; otherwise, an empty string ('').
     */

    public function validVideoID(string $video_id): string
    {
        if ($video_id) {
            $video_id = substr($video_id, strpos($video_id, "/shorts/")+8); // for shorts
            $video_id = trim($video_id);
            if (strlen($video_id) > 11) {
                if (preg_match("/youtu\.be/", $video_id)) {
                    // https://youtu.be/ID
                    $video_id = substr($video_id, strrpos($video_id, "/") + 1, 11);
                } else {
                    $video_id = substr($video_id, strpos($video_id, "?v=") + 3, 11);
                }
            }

            if (preg_match("/[^a-z0-9\-_]/i", $video_id) or strlen($video_id) != 11) {
                $video_id = '';
            }

        }
        return $video_id;
    }

}