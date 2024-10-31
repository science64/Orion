<?php

/*
 *
To get around CORS errors when working with SambaNova or NVIDIA, a proxy may be necessary.
This code is one of the possible solutions, for it to work you need to be running the code on localhost
or a hosting that supports PHP, this will not work on GitHub pages.
You will also need to enable the following JavaScript code in plugins.

To do this, click on "Options" -> Plugins and paste the JavaScript code provided below:


let page_url = new URL(document.URL);
page_url = page_url.origin + page_url.pathname;
if (page_url.charAt(page_url.length - 1) === '/') {
    page_url = page_url.slice(0, -1);
}
endpoint = page_url+"/proxy.php?platform="+chosen_platform;

function setProxyEndpoint(){
    if(chosen_platform === "sambanova" || chosen_platform === "nvidia"){
        let proxy_endpoint = page_url+"/proxy.php?platform="+chosen_platform;
        if(proxy_endpoint !== endpoint){
            let ra = `<p>You have changed platforms and are now using <b>${chosen_platform}</b> which requires proxy usage.
            To activate the proxy, reload the page.</p><p><button onclick="reloadPage()">Reload Page</button></p>`;
            addWarning(ra,false, 'fail_dialog')
        }
    }
}

let button_send = document.querySelector("#send");
chat_textarea.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        setProxyEndpoint();
    }
});

button_send.addEventListener("click", ()=>{
    setProxyEndpoint()
})


*/

ini_set('display_errors', 1);
$platform = $_GET["platform"] ?? '';
$post_data = file_get_contents('php://input');
if ($post_data) {
    if($platform === "sambanova") {
        $endpoint = "https://api.sambanova.ai/v1/chat/completions";
    }elseif ($platform === "nvidia"){
        $endpoint = "https://integrate.api.nvidia.com/v1/chat/completions";
    }else{
        exit("$platform has no proxy configuration");
    }

    $ch = curl_init($endpoint);
    $received_headers = getallheaders();
    $headers_to_send = [];
    foreach ($received_headers as $key => $value) {
        if ($key === "Authorization") {
            $headers_to_send[] = "$key: $value";
        }
    }
    $headers_to_send[] = "Content-Type: application/json";

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers_to_send);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $arr = json_decode($post_data);
    if(!empty($arr->stream)){
        header('Content-Type: text/event-stream');
    }
    header('Cache-Control: no-cache');
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) {
        echo $data;
        ob_flush();
        flush();
        return strlen($data);
    });
    curl_exec($ch);
    curl_close($ch);
    exit();
}

