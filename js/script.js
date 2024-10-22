let can_delete_history = false;
let max_chats_history = 50;
let chosen_platform = localStorage.getItem('chosen_platform');
let model = localStorage.getItem('selected_model');
let is_mobile = window.matchMedia("(max-width: 768px)").matches;
let api_key = localStorage.getItem(`${chosen_platform}.api_key`)
let base64String = '';
let mimeType = '';
let story = '';
let endpoint = localStorage.getItem('endpoint');
let last_role = '';
let last_cnt = '';
let last_user_input = '';
let is_chat_enabled = true;
let SITE_TITLE = "Orion";

// Markdown to HTML
showdown.setFlavor('github');
showdown.setOption('ghMentions', false); // if true "@something" became github.com/something
showdown.setOption("openLinksInNewWindow", true);
let converter = new showdown.Converter();


let PLATFORM_DATA = {
    openai: {
        models: [
            "o1-preview",
            "o1-mini",
            "gpt-4o",
            "gpt-4o-mini",
        ],
        name: "OpenAI",
        endpoint: "https://api.openai.com/v1/chat/completions"
    },
    google: {
        models: [
            "gemini-1.5-pro-002",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-flash-002",
        ],
        name: "Google",
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    },
    anthropic: {
        models: [
            "claude-3-5-sonnet-20241022",
            "claude-3-haiku-20240307"
        ],
        name: "Anthropic",
        endpoint: "https://api.anthropic.com/v1/messages"
    },
    cohere: {
        models: [
            "command-r-plus-08-2024",
            "command-r-plus-04-2024",
            "c4ai-aya-23-35b",
            "command-light"
        ],
        name: "Cohere",
        endpoint: "https://api.cohere.com/v2/chat"
    },
    groq: {
        models: [
            "llama-3.2-90b-text-preview",
            "llama-3.1-70b-versatile",
            "llama3-70b-8192",
            "mixtral-8x7b-32768",
            "llama-3.2-11b-vision-preview",
            "llama3-groq-8b-8192-tool-use-preview",
            "gemma2-9b-it",
            "llama3-groq-70b-8192-tool-use-preview"
        ],
        name: "Groq",
        endpoint: "https://api.groq.com/openai/v1/chat/completions"
    },
    cerebras: {
        models: [
            "llama3.1-8b",
            "llama3.1-70b"
        ],
        name: "Cerebras",
        endpoint: "https://api.cerebras.ai/v1/chat/completions"
    },
    ollama: {
        models: [],
        name: "Ollama",
        get_models_endpoint: "http://localhost:11434/v1/models",
        endpoint: "http://localhost:11434/v1/chat/completions"
    }
}

const language_extension = {
    "python": "py",
    "markdown": "md",
    "javascript": "js",
    "java": "java",
    "c": "c",
    "cpp": "cpp",
    "csharp": "cs",
    "ruby": "rb",
    "go": "go",
    "swift": "swift",
    "kotlin": "kt",
    "php": "php",
    "typescript": "ts",
    "rust": "rs",
    "dart": "dart",
    "scala": "scala",
    "perl": "pl",
    "r": "r",
    "shell": "sh",
    "haskell": "hs",
    "lua": "lua",
    "objectivec": "m",
    "matlab": "m",
    "sql": "sql",
    "html": "html",
    "css": "css",
    "json": "json",
    "xml": "xml",
    "yaml": "yaml",
    "txt": "txt"
}


let settings = document.querySelector("#settings");
settings.onclick = () => {
    let conversations = document.querySelector(".conversations");
    conversations.style.display = 'block';
    localStorage.setItem("hide_conversations", '0');
    let hasTopic = document.querySelector(".conversations .topic");
    if (!hasTopic) {
        let ele = document.createElement('div');
        ele.innerText = 'No history';
        ele.classList.add('no_history')
        conversations.append(ele)
        setTimeout(() => {
            ele.remove();
            conversations.style.display = 'none';
        }, 3000);
    }
}


let options = document.querySelector("#open_options");
options.onclick = () => {
    let cvns = document.querySelector('.conversations');
    if (cvns && is_mobile) {
        cvns.style.display = 'none'; // if open will be closed on mobile
    }
    console.log('oppp')

    setOptions();
}


let new_chat = document.querySelector("#new_chat");
new_chat.addEventListener('click', () => {
    newChat(); // start new chat
})

jsClose = document.querySelector(".jsClose");
jsClose.onclick = () => {
    document.querySelector('.conversations').style.display = 'none';
    localStorage.setItem("hide_conversations", '1');
}


setTimeout(() => {
    let chatMessages = document.querySelector("#chat-messages");
    chatMessages.scroll(0, 9559999);
}, 1000);


let conversations = {
    'messages': []
};

function addConversation(role, content, add_to_document = true, do_scroll = true) {
    closeDialogs();
    if (!content.trim()) {
        addWarning('Empty conversation', true);
        return false;
    }
    let new_talk = {'role': role, 'content': content};
    conversations.messages.push(new_talk);
    //chat_textarea.focus();
    let cnt;
    let div = document.createElement('div');
    div.classList.add('message');
    if (role === 'user') {
        div.classList.add('user');
        cnt = converter.makeHtml(content);
        div.innerHTML = cnt;
        if (base64String) {
            let media = mimeType.split("/")[0];
            if (media === 'image') {
                let imgEle = document.createElement('img');
                imgEle.src = base64String;
                div.prepend(imgEle);
                imgEle.className = 'appended_pic';
            } else if (media === 'audio') {
                let audioEle = document.createElement('audio');
                audioEle.src = base64String;
                audioEle.controls = true;
                div.prepend(audioEle);
                audioEle.className = 'appended_audio';
            } else if (media === 'video') {
                let videoEle = document.createElement('video');
                videoEle.src = base64String;
                videoEle.controls = true;
                div.prepend(videoEle);
                videoEle.className = 'appended_video';
            }
        }

    } else {
        let has_att = document.querySelector(".has_attachment");
        if (has_att) {
            has_att.classList.remove('has_attachment');
        }
        if (add_to_document) {
            div.classList.add('bot');
            cnt = converter.makeHtml(content);
            div.innerHTML = cnt;
            genAudio(content, div);
        } else {
            let lastBot = document.querySelectorAll(".bot")[document.querySelectorAll(".bot").length - 1];
            genAudio(content, lastBot);
        }

    }
    document.querySelector('#chat-messages').append(div);
    if (do_scroll) {
        div.scrollIntoView();

    }
    saveLocalHistory();
}


function saveLocalHistory() {
    localStorage.setItem(chat_id, JSON.stringify(conversations));
    loadOldChatTopics();
}

function getPreviousChatTopic() {
    let all_topics = [];
    // pega todos ids
    let ids = [];
    let total_chats = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let id = localStorage.key(i);
        id = parseInt(id);
        if (!isNaN(id)) {
            // important to the correct order
            ids.push(id);
        }
    }
    ids.sort((a, b) => b - a);  // descendent order
    let all_keys = [];

    ids.forEach(key => {
        if (total_chats >= max_chats_history) {
            // If it has to many messages remove the old ones
            localStorage.removeItem(key.toString());
        } else {
            all_keys.push(key);
        }
        total_chats++;
    })

    all_keys.forEach(id => {
        try {
            let topic = JSON.parse(localStorage.getItem(id))?.messages?.[0]?.content ?? '';
            let last_interaction = JSON.parse(localStorage.getItem(id))?.last_interact ?? id;
            if (topic) {
                all_topics.push({'topic': topic, 'id': id, 'last_interaction': last_interaction});
            }
        } catch (error) {
            console.error('Error parser to JSON: ' + error)
        }
    });
    return all_topics;
}

function removeChat(div, id) {
    if (can_delete_history) {
        let the_chat = JSON.parse(localStorage.getItem(id));
        if (div.classList.contains('confirm_deletion')) {
            localStorage.removeItem(id);
        } else {
            let tot_msgs = the_chat.messages.length;
            div.classList.add('confirm_deletion');
            if (tot_msgs < 19) {
                localStorage.removeItem(id);
            } else {
                let alert_msg =
                    `<p>Are you sure you want to delete?</p>
                    <p>This conversation has ${tot_msgs} messages.</p>
                    <p>If yes, click again to delete.</p>`;
                addWarning(alert_msg,false)
                div.classList.add('del_caution')
                return false;
            }
        }
        document.querySelectorAll(".del_caution").forEach((dc=>{
            dc.classList.remove('del_caution');
        }))

        document.querySelectorAll(".confirm_deletion").forEach((cd=>{
            cd.classList.remove('confirm_deletion');
        }))


        localStorage.removeItem(id);
        let ele = document.createElement('div');
        let content = document.querySelector(".container");
        ele.classList.add('chat_deleted_msg');
        if (id === chat_id) {
            // current chat - so clean the screen
            let all_user_msg = document.querySelectorAll("#chat-messages .message.user");
            let all_bot_msg = document.querySelectorAll("#chat-messages .message.bot");
            if (all_user_msg) {
                all_user_msg.forEach(um => {
                    um.remove();
                })
            }
            if (all_bot_msg) {
                all_bot_msg.forEach(bm => {
                    bm.remove();
                })
            }
            ele.innerText = "Current chat deleted!";
            content.prepend(ele);
            conversations.messages = []; // clean old conversation
            chat_id = new Date().getTime(); // generate a new chat_id

        } else {
            content.prepend(ele);
            ele.innerText = "Chat deleted!";
        }
        setTimeout(() => {
            ele.remove();
        }, 2000);
        div.remove();
    } else {
        //div.id will be id of chat (key de localStorage)
        // loadOldConversation(div.id); // update conversation
    }
}

/**
 * Starts a new chat without any context from past conversation
 **/
function newChat() {
    document.title = SITE_TITLE;
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    history.pushState({url: new_url}, '', new_url);

    removeScreenConversation();
    conversations.messages = []; // clean old conversation
    chat_id = new Date().getTime(); // generate a new chat_id


}

function removeScreenConversation() {
    let chatMessages = document.querySelector("#chat-messages")
    //remove old message on screen
    chatMessages.querySelectorAll(".message.user").forEach(userMsg => {
        userMsg.remove();
    })
    chatMessages.querySelectorAll(".message.bot").forEach(botMsg => {
        botMsg.remove();
    })
}


function loadOldConversation(old_talk_id) {
    chat_id = old_talk_id;
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    new_url += "#" + old_talk_id;
    history.pushState({url: new_url}, '', new_url);

    let past_talk = localStorage.getItem(old_talk_id); // grab the old conversation

    localStorage.removeItem(old_talk_id); // remove old conversation from localstorage
    //chat_id = new Date().getTime(); // renew ID
    let last_interaction_id = new Date().getTime();

    //let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");
    let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");

    //btn_star_old_chat.setAttribute("data-id", chat_id);
    btn_star_old_chat.setAttribute("data-last-interaction", last_interaction_id.toString());
    document.title = btn_star_old_chat.innerText;


    let chatMessages = document.querySelector("#chat-messages");
    if (past_talk) {
        let messages = JSON.parse(past_talk).messages;
        conversations.messages = messages;
        conversations.last_interact = last_interaction_id;
        localStorage.setItem(old_talk_id.toString(), JSON.stringify(conversations));

        removeScreenConversation();
        messages.forEach(msg => {
            let div_talk = document.createElement('div');
            div_talk.classList.add('message');
            if (msg.role === 'user') {
                div_talk.classList.add('user');
                div_talk.innerHTML = converter.makeHtml(msg.content);
            } else {
                div_talk.classList.add('bot');
                div_talk.innerHTML = converter.makeHtml(msg.content);
            }

            chatMessages.append(div_talk);

        });


    } else {
        let topic_with_no_chat = document.querySelector(".topic[data-id='" + chat_id + "']");
        if (topic_with_no_chat) {
            topic_with_no_chat.remove();
        }
        createDialog('Conversation not found!', 10)
    }
    hljs.highlightAll();
    setTimeout(() => {
        enableCopyForCode();
    }, 500)

}


function loadOldChatTopics() {
    let all_topics = getPreviousChatTopic();
    let history = document.querySelector(".conversations .history");
    let to_remove = history.querySelectorAll(".topic");
    // remove to add again updating with the current chat
    to_remove.forEach(ele => {
        ele.remove();
    })
    for (let i = 0; i < all_topics.length; i++) {
        let prev = all_topics[i];
        let div = document.createElement('div');
        let divWrap = document.createElement('div');
        div.classList.add('topic');
        div.classList.add('truncate');
        if (can_delete_history) {
            div.classList.add('deletable')
        }
        div.textContent = prev.topic.substring(0, 50);
        div.title = prev.topic.substring(0, 90);

        div.setAttribute('data-id', prev.id)
        div.setAttribute('data-last-interaction', prev.last_interaction)
        div.addEventListener('click', () => {
            let the_id = div.getAttribute('data-id');
            if (can_delete_history) {
                removeChat(div, the_id);
            } else {
                let all_active_topic = document.querySelectorAll(".active_topic");
                all_active_topic.forEach(t => {
                    t.classList.remove('active_topic');
                })
                div.classList.add('active_topic')
                loadOldConversation(the_id)
            }
        })
        divWrap.append(div);
        history.append(divWrap);
    }
}

loadOldChatTopics();

function getSystemPrompt() {
    return localStorage.getItem('system_prompt');
}

function chat() {
    if (chosen_platform === 'google') {
        return geminiChat();
    }
    return streamChat();
}

function removeLastMessage() {
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        document.querySelector(".chat-input textarea").value = ele.innerText;
        conversations.messages.pop();
        if (conversations.messages.length) {
            localStorage.setItem(chat_id.toString(), JSON.stringify(conversations));
        } else {
            localStorage.removeItem(chat_id.toString());
        }
        ele.remove();
    }
}

let chatButton = document.querySelector(".chat-input button");
let chat_textarea = document.querySelector(".chat-input textarea");

function startChat() {
    if (!is_chat_enabled) {
        addWarning('Chat is busy. Please wait!');
        return false;
    }
    let input_text = chat_textarea.value;
    if (input_text.trim().length > 0) {
        toggleAnimation();
        chat_textarea.value = '';
        disableChat()
        addConversation('user', input_text);
        chat();
    }
}

chatButton.onclick = () => {
    startChat();
}
chat_textarea.onkeyup = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        startChat();
    }
}


function addWarning(msg, self_remove = true, add_class = '') {
    if (typeof (msg) != 'string') {
        msg = JSON.stringify(msg);
    }
    let duration = 0;
    if (self_remove) {
        duration = 7;
    }
    createDialog(msg, duration, add_class)
}


function disableChat() {
    is_chat_enabled = false;
}

function enableChat() {
    is_chat_enabled = true;
}

function toggleAnimation(force_off = false) {
    let loading = document.querySelector("#loading")
    if (loading.style.display === 'inline-flex') {
        loading.style.display = 'none';
    } else {
        loading.style.display = 'inline-flex';
    }
    if (force_off) {
        loading.style.display = 'none';
    }
}


let can_delete = document.querySelector("#can_delete");
if (can_delete != null) {
    can_delete.addEventListener('change', (event) => {
        if (event.target.checked) {
            can_delete_history = true;
            let all_topics = document.querySelectorAll(".conversations .topic");
            all_topics.forEach(topic => {
                topic.classList.add('deletable');
            })
        } else {
            can_delete_history = false;
            let all_topics = document.querySelectorAll(".conversations .topic");
            all_topics.forEach(topic => {
                topic.classList.remove('deletable');
            })
        }
    });
}

function closeDialogs() {
    let dialog_close = document.querySelectorAll(".dialog_close");
    if (dialog_close) {
        dialog_close.forEach(dc => {
            if (dc.classList.contains('can_delete')) {
                dc.click();
            }
        })
    }

}


function enableCopyForCode(enable_down_too = true) {
    document.querySelectorAll('code.hljs').forEach(block => {
        let block_group = block.nextElementSibling;
        let has_copy_btn = false;
        if (block_group) {
            has_copy_btn = block_group.querySelector(".copy-btn");
        }
        if (!has_copy_btn) {   // to not be added more the one time
            const button = document.createElement('button');
            const div_ele = document.createElement('div');
            div_ele.className = 'btn-group';
            button.className = 'copy-btn';
            button.innerText = 'Copy';
            const btn_down = button.cloneNode(false);
            btn_down.className = 'down-btn';
            btn_down.innerText = 'Down';
            div_ele.append(button);
            if (enable_down_too) {
                div_ele.append(btn_down);
            }
            block.parentElement.append(div_ele);
            button.addEventListener('click', () => {
                const codeText = block.innerText.replace('Copy', '');
                navigator.clipboard.writeText(codeText)
                    .then(() => {
                        button.innerText = 'Copied!';
                        setTimeout(() => button.innerText = 'Copy', 2000);
                    })
                    .catch(err => console.error('Error:', err));
            });
        }
    });

    if (enable_down_too) {
        enableCodeDownload();
    }
}


function enableCodeDownload() {
    let downloadCodeBtn = document.querySelectorAll(".down-btn");
    if (downloadCodeBtn) {
        downloadCodeBtn.forEach(btn => {
            btn.addEventListener("click", function () {
                const code = btn.parentElement.parentElement.querySelector("code");
                let lang_name = code.classList[0] ?? 'txt';
                if (lang_name === "hljs") {
                    lang_name = code.classList[1]?.split("-")[1] ?? 'txt';
                }
                let extension = language_extension[lang_name] ?? 'txt';
                let ai_full_text = btn.parentElement.parentElement.parentElement.innerHTML;
                let file_name = ai_full_text.match(new RegExp(`([a-zA-Z0-9_-]+\\.${extension})`, 'g'));
                let more_than_one = btn.parentElement.parentElement.parentElement.querySelectorAll("." + lang_name);
                // more_then_one = more than one code with the same extension
                if (file_name) {
                    file_name = file_name[0];
                    if (more_than_one.length >= 2) {
                        file_name = 'file.' + extension;
                        // can't determine precisely the file name(because have two or more),
                        // so file_name will be default to file.ext
                    }
                } else {
                    file_name = 'file.' + extension;
                }


                let code_text = code.innerText;
                const blob = new Blob([code_text]);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file_name;
                a.click();
                URL.revokeObjectURL(url);
            });
        })
    }
}


/**
 * add a message on the screen
 * - text: text to be added
 * - duration_seconds: optional - total duration in seconds
 * - add_class_name: optional - add a personalized class to add new style to dialog
 * - can_delete - If the user will be able to remove the dialog
 **/
function createDialog(text, duration_seconds = 0, add_class_name = '', can_delete = true) {
    let all_dialogs = document.getElementById("all_dialogs");
    let dialog_close = document.createElement('span');
    dialog_close.classList.add('dialog_close');
    let dialog = document.createElement('div');
    dialog.classList.add('dialog');
    if (add_class_name) {
        dialog.classList.add(add_class_name);
    }
    dialog.innerHTML = text;
    dialog.append(dialog_close);
    dialog.style.display = 'block';
    all_dialogs.append(dialog);
    if (can_delete) {
        dialog_close.classList.add('can_delete');
    }
    dialog_close.onclick = () => {
        dialog.remove();
    }

    if (duration_seconds) {
        let ms = duration_seconds * 1000;
        setTimeout(() => {
            dialog.remove();
        }, ms)
    }


}

function geminiChat(fileUri = '', with_stream = true, the_data = '') {
    let all_parts = [];
    let system_prompt = getSystemPrompt();
    conversations.messages.forEach(part => {
        let role = part.role === 'assistant' ? 'model' : part.role;
        all_parts.push({
            "role": role,
            "parts": [
                {
                    "text": part.content
                }
            ]
        });
    })

    if (base64String) {
        geminiUploadImage().then(response => {
            console.log('uploading')
            return response;
        }).then(fileUri => {
            base64String = '';
            geminiChat(fileUri)
        })
        return false;
    }

    if (fileUri) {
        all_parts[(all_parts.length - 1)].parts.push({
            "file_data":
                {
                    "mime_type": mimeType,
                    "file_uri": fileUri
                }
        })
    }
    mimeType = '';
    let data = {
        "contents": [all_parts]
    };

    if (system_prompt) {
        data.systemInstruction = {
            "role": "user",
            "parts": [
                {
                    "text": system_prompt
                }
            ]
        };
    }

    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    let cmd = commandManager(last_user_input)
    if (cmd) {
        data.contents.push({
            "role": 'user',
            "parts": [
                {
                    "text": cmd
                }
            ]
        });
    }

    data.safetySettings = [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ];


    data.generationConfig = {
        // "temperature": 1,
        // "topK": 40,
        // "topP": 0.95,
        // "maxOutputTokens": 8192,
    };

    if (the_data) {
        data = the_data;
    }

    if (needToolUse(last_user_input)) {
        let tool_name = whichTool(last_user_input);
        let tool_compatibility = `google_compatible`; // ex
        let the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
        if (the_tool) {
            with_stream = false; // in this case for tool use we will not use stream mode
            data.tools = [the_tool];
            data.toolConfig = {
                "functionCallingConfig": {
                    "mode": "ANY"
                }
            };
        } else {
            console.log('g: do not has tool')
        }
    }


    if (with_stream) {
        return geminiStreamChat(fileUri, data);
    }

    let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${api_key}`
    let invalid_key = false;
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            let text;
            if (typeof data === "object") {
                try {
                    text = data.candidates[0].content.parts[0]?.text ?? '';
                    if (!text) {
                        let g_tool = data.candidates[0].content.parts[0]?.functionCall ?? '';
                        if (g_tool) {
                            toolHandle(g_tool);
                        } else {
                            addWarning('Error: Unexpected response', true, 'fail_dialog')
                        }

                    }
                } catch {
                    text = '<pre>' + JSON.stringify(data) + '</pre>';
                    try {
                        // Verify if it is an error with the api key being not valid
                        let tt = data.error.message;
                        if (tt.match(/API key not valid/)) {
                            invalid_key = true;
                        }
                    } catch {
                        console.error('Ops error, no: data.error.message')
                    }
                    removeLastMessage()
                }
            } else {
                text = data;
            }
            addConversation('assistant', text);

        })
        .catch(error => {
            addWarning('Error: ' + error, false);
            removeLastMessage();
        }).finally(() => {
        toggleAnimation(true);
        enableChat();
        if (invalid_key) {
            setApiKeyDialog();
        }
        hljs.highlightAll();
        enableCopyForCode();

    })


}


function setApiKey() {
    let set_api_key = document.querySelector('#set_api_key');
    if (set_api_key) {
        api_key = set_api_key.value.trim();
        if (api_key.length > 10) {
            localStorage.setItem(`${chosen_platform}.api_key`, api_key)
            closeDialogs();
            createDialog('Saved with success!', 4);
        }
    }
}

function setApiKeyDialog() {
    let platform_name = PLATFORM_DATA[chosen_platform].name;
    let cnt =
        `<div>Enter your API key for <strong>${platform_name}</strong>!</div>
         <input id="set_api_key" type="text" name="api_key" placeholder="Your API key">
         <button onclick="setApiKey()">Save</button>
         <div>
         <p>Your API key will be saved in localStorage.</p>
         </div>`;
    createDialog(cnt, 0, 'setApiDialog');
}


function setOptions() {
    closeDialogs(); // close opened dialogs before show options dialog
    let system_prompt = getSystemPrompt();
    if (!system_prompt) {
        system_prompt = '';
    }
    let prompts_options = '';
    let prompt_id = 0;
    if (typeof (all_prompts) !== "undefined") {
        prompts_options += '<select name="prompt"><option selected="selected" disabled="disabled">Awesome Prompts</option>';
        all_prompts.forEach(the_prompt => {
            let prompt_text = the_prompt.prompt.replace(/"/g, '&quot;');
            prompts_options += `<option id="prompt_id${prompt_id}" value="${prompt_text}">${the_prompt.act}</option>`;
            prompt_id++;
        });
        prompts_options += '</select>';
    }
    let platform_info = '';
    let platform_name = '';
    if (chosen_platform) {
        platform_name = PLATFORM_DATA[chosen_platform].name ?? '';
        platform_info = `<p class="platform_info">Active:<b> ${model}</b> from <b>${platform_name}</b></p>`;
    }
    let platform_options = '<div><p>Choose a Model</p><select name="platform"><option disabled="disabled" selected="selected">Select</option>';
    let mark_as_select = '';
    Object.keys(PLATFORM_DATA).forEach(platform => {
        let list_models = PLATFORM_DATA[platform].models;
        let platform_name = PLATFORM_DATA[platform].name;
        platform_options += `<optgroup label="${platform_name}">`;
        list_models.forEach(model_name => {
            if (model_name === model) {
                mark_as_select = "selected='selected'";
            }
            platform_options += `<option ${mark_as_select} data-platform="${platform}" value="${model_name}">${model_name}</option>`;
            mark_as_select = '';
        })
        platform_options += `</optgroup>`;
    })
    platform_options += `</select></div>`;


    let more_option = `<button class="more_opt_btn" onclick="moreOptions()">More Options</button>`;

    let cnt =
        `<div>${platform_options}
         <input type="text" name="api_key" placeholder="API Key(if not defined yet)">
         <button onclick="saveModel()" class="save_model">Save Model</button></div><hr>
         <div><strong>System Prompt</strong>
         ${prompts_options}
         <textarea class="system_prompt" placeholder="(Optional) How the AI should respond?">${system_prompt}</textarea>
         <button onclick="savePrompt()" class="save_prompt">Save Prompt</button>
         ${platform_info}
         <p>${more_option}</p>
         </div>`;
    createDialog(cnt, 0, 'optionsDialog');

    setTimeout(() => {

        let sl_platform = document.querySelector("select[name=platform]");
        if (sl_platform) {
            sl_platform.onchange = () => {
                let btn_sm = document.querySelector('.save_model');
                if (btn_sm) {
                    btn_sm.classList.add('animate');
                }
            }
        }

        let sl_prompt = document.querySelector("select[name=prompt]");
        if (sl_prompt) {
            sl_prompt.onchange = (item => {
                let btn_sp = document.querySelector('.save_prompt');
                if (btn_sp) {
                    btn_sp.classList.add('animate');
                }
                let txt_area = document.querySelector("textarea.system_prompt");
                if (txt_area) {
                    txt_area.value = item.target.value;
                }
            })
        }
    }, 500)

}


function moreOptions(show = 'all') {
    closeDialogs(); // close opened dialogs before show options dialog

    let m_disable_audio_option = '';
    let m_is_audio_feature_active = localStorage.getItem('audio_feature')
    m_is_audio_feature_active = parseInt(m_is_audio_feature_active);
    let m_is_eleven_keys_set = localStorage.elabs_api_key ?? '';
    if (m_is_audio_feature_active) {
        m_disable_audio_option = `<p><b id="audio_txt_status">Audio active:</b> <button class="disable_btn" onclick="disableAudioFeature()">Disable Audio</button></p>`;
    } else {
        if (m_is_eleven_keys_set) {
            m_disable_audio_option = `<p><b id="audio_txt_status">Audio is disabled:</b> <button onclick="enableAudioFeature()">Enable Audio</button></p>`;
        }
    }
    let m_audio_options =
        `<p>If you want an audio response, you can set up an API key for ElevenLabs below.</p>
         <input type="text" name="elabs_api_key" placeholder="ElevenLabs API Key">
         <button onclick="enableAudioFeature()">Save Key</button>
        `;
    let cse_option = `
    <hr>
    <p><span class="beta_warning"></span><b>RAG: Search With Google</b></p>
    <p>By enabling Google <abbr title="Custom Search Engine">CSE</abbr> You will be able to ask the AI to search the internet.</p>
    <input type="text" id="cse_google_api_key" name="cse_google_api_key" placeholder="Google CSE API Key">
    <input type="text" id="cse_google_cx_id" name="cse_google_cx_id" placeholder="Google CX ID">
    <button onclick="enableGoogleCse()">Activate</button>
    `;
    let g_cse_status = '';
    if (isGoogleCseActive()) {
        g_cse_status = `<button id="disable_g_cse" class="disable_btn" onclick="disableGoogleCse()">Disable CSE</button`;
    }


    let import_export_configs =
        `<div>
         <hr>
         <p>Import or export settings and saved chats.</p>
          <button onclick="downloadChatHistory()">Export</button>
          <button onclick="restoreChatHistory()">Import</button>
         </div>`;

    let cnt =
        `<div>
         ${m_audio_options}
         ${m_disable_audio_option}
         ${cse_option}
         ${g_cse_status}
         ${import_export_configs}
         </div>`;
    if (show === 'cse') {
        cnt =
            `<div>
              ${cse_option}
              ${g_cse_status}
         </div>`;
    }
    createDialog(cnt, 0, 'optionsDialog');
}


function orderTopics() {
    let topics = document.querySelectorAll('.topic');
    if (topics.length) {
        let topicsArray = Array.prototype.slice.call(topics);
        topicsArray.sort(function (a, b) {
            let interactionA = parseInt(a.getAttribute('data-last-interaction'));
            let interactionB = parseInt(b.getAttribute('data-last-interaction'));
            return interactionB - interactionA;
        });
        let parent = topicsArray[0].parentNode;
        topicsArray.forEach(function (topic) {
            parent.appendChild(topic);
        });
    }

}

function savePrompt() {
    let btn_sp = document.querySelector('.save_prompt');
    if (btn_sp) {
        btn_sp.classList.remove('animate');
    }
    let sys_prompt = document.querySelector("textarea.system_prompt").value.trim();
    if (sys_prompt.length) {
        localStorage.setItem('system_prompt', sys_prompt);
    } else {
        localStorage.removeItem('system_prompt')
    }
    saveModel();
    closeDialogs();
}

function saveModel() {
    let btn_sm = document.querySelector('.save_model');
    if (btn_sm) {
        btn_sm.classList.remove('animate');
    }

    let sl_platform = document.querySelector("select[name=platform]")
    let selected_option = sl_platform.options[sl_platform.selectedIndex];
    model = selected_option.value.trim();
    localStorage.setItem('selected_model', model);
    let selected_platform = selected_option.getAttribute('data-platform');
    let input_api_key = document.querySelector("input[name=api_key]").value.trim();
    if (input_api_key) {
        api_key = input_api_key; /// need to be like that
    }
    localStorage.setItem('chosen_platform', selected_platform);
    chosen_platform = selected_platform;
    let platform_name = PLATFORM_DATA[chosen_platform].name;
    endpoint = PLATFORM_DATA[selected_platform].endpoint;
    localStorage.setItem('endpoint', endpoint)
    if (input_api_key) {
        localStorage.setItem(`${chosen_platform}.api_key`, api_key)
    } else {
        api_key = localStorage.getItem(`${chosen_platform}.api_key`)
    }
    if (!api_key && chosen_platform === 'ollama') {
        api_key = 'i_love_ollama_'.repeat(3);
        localStorage.setItem(`${chosen_platform}.api_key`, api_key);
    }
    let platform_info = document.querySelector(".platform_info");
    if (platform_info) {
        platform_info.innerHTML = `Active: <b>${model}</b> from <b>${platform_name}</b>`;
    }
    createDialog('Saved with success!', 3)

}

let hc = localStorage.getItem("hide_conversations");
if (hc === '1') {
    document.querySelector('.conversations').style.display = 'none';
} else {
    if (!is_mobile) {
        document.querySelector('.conversations').style.display = 'block';
    }
}

if (!api_key) {
    let open_options = document.querySelector("#open_options");
    open_options.click();
}

let page_chat_id = document.URL.split("#")[1];
let current_chat = document.querySelector("[data-id='" + page_chat_id + "']");

if (current_chat) {
    current_chat.click();
} else if (page_chat_id) {
    // Chat id doesn't exist, will update the URL to home page
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    history.pushState({url: new_url}, '', new_url);
}

orderTopics();


function ollamaGuide() {
    if (is_mobile) {
        console.log('User seem to be in mobile device')
        return false;
    }
    let this_domain = `${location.protocol}//${location.hostname}`;
    let guide = `<div>
  <p>If you want to use Ollama, you may need to make some configurations in your local Ollama setup.</p>
  <p>Please take a look at the Ollama docs:</p>
  <p>See these links:<br>
    -> <a target="_blank" href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama">Additional web origins</a><br>
    -> <a target="_blank" href="https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux">Setting environment variables</a>
  </p>
  <p>Linux CLI example:</p>
  <pre><code>systemctl edit ollama.service</code></pre>
  <p>Add the following:</p>
  <pre><code>[Service]
Environment=OLLAMA_ORIGINS=${this_domain}</code></pre>
  <p><br>This will allow <strong>${this_domain}</strong> to access http://localhost:11434/</p>
</div>`

    createDialog(guide, 0, 'cl_justify')
    hljs.highlightAll();
    setTimeout(() => {
        enableCopyForCode(false);
    }, 500)

}


function getOllamaModels() {
    let ollama_models_endpoint = PLATFORM_DATA.ollama.get_models_endpoint;
    let optgroup_ollama = document.querySelector("select[name=platform] [label=Ollama]")
    let start_time = new Date().getTime();
    fetch(ollama_models_endpoint)
        .then(response => {
            return response.json();
        })
        .then(data => {
            data = data.data ?? [];
            data.forEach(ollama_model => {
                let option_element = document.createElement('option');
                option_element.setAttribute("data-platform", "ollama");
                option_element.value = ollama_model.id;
                option_element.innerText = ollama_model.id;
                if (optgroup_ollama) {
                    optgroup_ollama.append(option_element)
                }
                PLATFORM_DATA.ollama.models.push(ollama_model.id);
            })
        }).catch(error => {
            console.warn(error)
            let end_time = new Date().getTime()
            let past_time = end_time - start_time;
            if (past_time > 1200) {
                //console.log("user don't seem to have ollama running");
            } else {
                console.log('user seems to have ollama running with cors policy')
                let guide_warnings = localStorage.getItem('guide_warnings');
                if (!guide_warnings) {
                    guide_warnings = 0;
                }
                guide_warnings = parseInt(guide_warnings);
                guide_warnings++
                if (guide_warnings <= 4) {
                    ollamaGuide();
                }
                localStorage.setItem('guide_warnings', guide_warnings.toString());
            }
        }
    )
}

getOllamaModels();

function disableAudioFeature() {
    let audio_txt_status = document.querySelector("#audio_txt_status");
    audio_txt_status.innerText = 'Audio is disabled!'
    localStorage.setItem('audio_feature', '0');
    addWarning('Audio feature disabled', true)
}

function enableAudioFeature() {
    let audio_txt_status = document.querySelector("#audio_txt_status");
    localStorage.setItem('audio_feature', '1');
    let input_ele = document.querySelector("input[name=elabs_api_key]");

    if (input_ele && input_ele.value.trim().length > 5) {
        elabs_api_key = input_ele.value.trim();
        localStorage.setItem('elabs_api_key', elabs_api_key)
        addWarning('Audio feature enabled', true)
        audio_txt_status.innerText = 'Audio is enabled!'
    } else {
        if (!elabs_api_key) {
            addWarning('Ops. No key provided!', false)
        } else {
            addWarning('Audio feature enabled', true)
            audio_txt_status.innerText = 'Audio is enabled!'
        }
    }

}


function needToolUse(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0];
    return cmd === "search:" || cmd === 's:';
    // If it has some command to search will need to use tools


}

function whichTool(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0] ?? '';
    if ((cmd === "search:" || cmd === 's:')) {
        return 'googleSearch';
    }
    return '';
}

function commandManager(text) {
    text = text.trim() + " ";
    let arr = text.match(/^[a-z]+:(.*?)\s/i);
    let cmd = '';
    let args = '';
    if (arr) {
        cmd = arr[0];
        cmd = cmd.replace(/:(.*)/, "");
        if (arr[1]) {
            args = arr[1];
        }
    }

    let prompt = especial_prompts[cmd] ?? '';
    if (!prompt) {
        return false; // no command passed
    }

    text = text.replace(/^[a-z]+:(.*?)\s/i, " ").trim();
    prompt = prompt.replaceAll("{{USER_INPUT}}", text);
    prompt = prompt.replaceAll("{{ARG1}}", args);
    return prompt; // return the new prompt formated

}


async function streamChat(can_use_tools = true) {
    let first_response = true;
    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    let cmd = commandManager(last_user_input)
    let all_parts = [];
    let invalid_key = false;
    let system_prompt_text = getSystemPrompt();
    if (system_prompt_text) {
        let system_prompt = {content: system_prompt_text, 'role': 'system'};
        if (chosen_platform !== 'anthropic') {
            if (!cmd) {
                if (!base64String) {
                    // Groq vision accept no system prompt??
                    all_parts.push(system_prompt);
                }
            }
        }
    }

    conversations.messages.forEach(part => {
            //let role = part.role === 'assistant' ? 'model' : part.role;
            let cnt = part.content;
            last_role = part.role;
            last_cnt = part.content;
            if (chosen_platform === 'anthropic') {
                let ant_part =
                    {
                        role: part.role,
                        content: [{type: 'text', text: cnt}]
                    }
                all_parts.push(ant_part);
            } else if (chosen_platform === 'cohere') {
                let cohere_part =
                    {
                        role: part.role,
                        content: cnt
                    };
                all_parts.push(cohere_part);

            } else {
                all_parts.push({content: part.content, role: part.role});
            }

        }
    ); // end forEach

    if (base64String && last_role === 'user' && chosen_platform === 'anthropic') {
        let ant_part = {
            role: last_role,
            content: [{
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": mimeType,
                    "data": base64String.split(',')[1]
                }
            }, {type: 'text', text: last_cnt}]
        };
        all_parts.pop(); // remove last
        all_parts.push(ant_part); // add with image scheme
        base64String = '';
        mimeType = '';
    } else if (base64String && last_role === 'user') {
        all_parts.pop();
        all_parts.push({
            "role": last_role,
            "content": [
                {
                    "type": "text",
                    "text": last_cnt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": base64String
                    }
                }]
        });
        base64String = '';
        mimeType = '';

    }

    if (cmd) {
        all_parts.pop() // remove last
        // have cmd - so will just past the last user message in the command
        if (chosen_platform === 'anthropic') {
            let ant_part =
                {
                    role: 'user',
                    content: [{type: 'text', text: cmd}]
                };
            all_parts.push(ant_part);
        } else {
            all_parts.push({content: cmd, role: 'user'});
        }
    }

    let data =
        {
            model: model,
            stream: true,
            messages: all_parts,
        }
    if (chosen_platform === 'anthropic') {
        if (!system_prompt_text) {
            system_prompt_text = "Your name is Orion"; // Anthropic requires a system prompt
        }
        data.system = system_prompt_text;
        data.max_tokens = 4096;
        if (cmd) {
            data.system = "Your name is Orion."; //
        }
    }


    let HTTP_HEADERS = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
        'x-api-key': `${api_key}`, // for Anthropic
        "anthropic-version": "2023-06-01", // for Anthropic
        "anthropic-dangerous-direct-browser-access": "true"
    };
    if (chosen_platform === 'ollama') {
        HTTP_HEADERS = {};
    }
    let the_tool = '';
    if (can_use_tools) {
        if (needToolUse(last_user_input)) {
            let tool_name = whichTool(last_user_input);
            let tool_compatibility = `openai_compatible`;
            if (chosen_platform === 'anthropic') {
                tool_compatibility = 'anthropic_compatible';
            } else if (chosen_platform === 'cohere') {
                tool_compatibility = 'cohere_compatible';
            }

            the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
            if (the_tool) {
                data.stream = false; // in this case for tool use we will not use stream mode
                data.tools = [the_tool];
                if (chosen_platform !== 'cohere') {
                    data.tool_choice = "required";
                }
                if (chosen_platform === 'anthropic') {
                    data.tools = [the_tool];
                    data.tool_choice = {"type": "tool", "name": "googleSearch"};
                }
            } else {
                console.log('do not has tool')
            }
        }
    }

    const requestOptions = {
        method: 'POST',
        headers: HTTP_HEADERS,
        body: JSON.stringify(data)
    };


    if (!endpoint) {
        setOptions();
        toggleAnimation();
        removeLastMessage();
        return false;
    }

    try {
        const response = await fetch(endpoint, requestOptions);
        if (!response.ok) {
            response.json().then(data => {
                setTimeout(() => {
                    addWarning(data);
                }, 500)
                removeLastMessage();
                toggleAnimation();
                enableChat();
                let the_code = data.code ?? data.error?.code ?? data.error?.message ?? data.message ?? '';
                if (the_code === "wrong_api_key" || the_code === "invalid_api_key" || the_code === "invalid x-api-key" || the_code === "invalid api token") {
                    setApiKeyDialog();
                }
            })
            return false;
        }


        story = '';
        let cloned_response = response.clone();
        const reader = response.body.getReader();
        let chatContainer = document.querySelector('#chat-messages');
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot');
        if (!the_tool) {
            chatContainer.append(botMessageDiv);
        }
        let buffer = '';
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story === '') {
                    cloned_response.json().then(data => {
                        processFullData(data);
                        if (story) {
                            addConversation('assistant', story, true, true);
                            enableCopyForCode(true);
                            hljs.highlightAll();
                        } else {
                            // probably not stream - tool use
                            toggleAnimation();
                            toolHandle(data);
                            return false;
                        }
                    })
                } else {
                    processBuffer(buffer);
                    addConversation('assistant', story, false, false);
                }

                break;
            }

            const textDecoder = new TextDecoder('utf-8');
            const chunk = textDecoder.decode(value, {stream: true});
            buffer += chunk;
            let separator = chosen_platform === 'anthropic' ? '\n\n' : '\n';
            let parts = buffer.split(separator);

            buffer = parts.pop() || '';

            for (let part of parts) {
                if (part.startsWith('data: ') || part.startsWith('event: content_block_delta')) {
                    if (!part.startsWith('data: [DONE]')) {
                        try {
                            processDataPart(part);
                        } catch (jsonError) {
                            addWarning(JSON.stringify(jsonError));
                            console.error("JSON error: ", jsonError);
                        }
                    }
                }
            }

            botMessageDiv.innerHTML = converter.makeHtml(story);
            hljs.highlightAll();
            if (first_response) {
                first_response = false;
                toggleAnimation();
                botMessageDiv.scrollIntoView();
            }

        }

    } catch (error) {
        console.error("Error:", error);
        if (error === {}) {
            error = 'Error: {}';

        }
        toggleAnimation(true);
        addWarning(error, false)
        // Display error message in the chat
        if (invalid_key) {
            setApiKeyDialog();
        }
    } finally {
        enableCopyForCode();
        enableChat();
    }
}

function detectAttachment() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                mimeType = file.type;
                const reader = new FileReader();
                reader.onload = function (event) {
                    base64String = event.target.result;
                    fileInput.parentElement.classList.add('has_attachment')
                    fileInput.value = '';
                }
                reader.readAsDataURL(file);
            }
        }
    }
}

detectAttachment();


async function geminiUploadImage() {
    if (!base64String) {
        return false;
    }

    // the same content will not be uploaded again in less than 23 hours for Google Gemini
    let md5_value = MD5(decodeURIComponent(encodeURIComponent(base64String)));
    let upload_date = localStorage.getItem(md5_value);
    let today_date = new Date().getTime();
    if (upload_date) {
        upload_date = parseInt(upload_date);
        upload_date = new Date(upload_date);
        const differ_ms = today_date - upload_date;
        const d_seconds = Math.floor(differ_ms / 1000);
        const d_minutes = Math.floor(d_seconds / 60);
        const d_hours = Math.floor(d_minutes / 60);
        if (d_hours < 48) {
            let store_fileUri = localStorage.getItem('file_' + md5_value); // stored fileUri
            if (store_fileUri) {
                return store_fileUri;
            }
        }

    } else {
        console.log('file is new')
    }

    let baseUrl = 'https://generativelanguage.googleapis.com';

    mimeType = base64String.substring(base64String.indexOf(":") + 1, base64String.indexOf(";"));

    const byteCharacters = atob(base64String.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    let imgBlob = new Blob([byteArray], {type: mimeType});
    try {
        // Define headers and initiate the resumable upload
        const startUploadOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': imgBlob.size,
                'X-Goog-Upload-Header-Content-Type': imgBlob.type,
            },
            body: JSON.stringify({'file': {'display_name': 'TEXT'}}),
        };

        const startRes = await fetch(`${baseUrl}/upload/v1beta/files?key=${api_key}`, startUploadOptions);
        const uploadUrl = startRes.headers.get('X-Goog-Upload-URL');

        // Upload the actual bytes
        const uploadOptions = {
            method: 'POST',
            headers: {
                'Content-Length': imgBlob.size,
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: imgBlob,
        };

        const uploadRes = await fetch(uploadUrl, uploadOptions);
        const fileInfo = await uploadRes.json();
        const fileUri = fileInfo.file.uri;


        let file_state = ''
        let start_time = new Date().getTime();
        while (file_state !== 'ACTIVE') {
            console.log('while: file_state:' + file_state)
            await fetch(fileUri + "?key=" + api_key)
                .then(response => response.json())
                .then(data => {
                    file_state = data.state;
                })
                .catch(error => {
                    console.error('Request error:', error);
                });
            if (file_state === 'ACTIVE') {
                break;
            } else {
                await delay(5000); // wait 5 seconds
                // wait 5 secs before verify again
            }
            let past_time = new Date().getTime() - start_time;
            let past_seconds = past_time / 1000;
            if (past_seconds > 180) {
                addWarning('Upload is taking to much time. Try again later.', false)
                console.log('Upload is taking to much time')
                break;
            }


        }

        localStorage.setItem('file_' + md5_value, fileUri);
        localStorage.setItem(md5_value, new Date().getTime().toString());

        return fileUri;


    } catch (error) {
        console.error('Error:', error);
    }
    return false;
}


async function geminiStreamChat(fileUri, data) {
    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    if (needToolUse(last_user_input)) {
        let tool_name = whichTool(last_user_input);
        let tool_compatibility = `google_compatible`;
        let the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
        if (the_tool) {
            geminiChat(fileUri, false)
        } else {
            console.log('has not tool')
        }
    }

    const endpoint_stream = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${api_key}`;
    let first_response = true;
    try {
        const the_response = await fetch(endpoint_stream, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!the_response.ok) {
            the_response.json().then(data => {
                setTimeout(() => {
                    addWarning(data);
                }, 500)
                removeLastMessage();
                toggleAnimation(true);
                enableChat();
                let tt = data.error?.message ?? 'nada';
                if (tt.match(/API key not valid/)) {
                    setApiKeyDialog();
                }
            })
            return false;
        }
        const reader = the_response.body.getReader();
        let chatContainer = document.querySelector('#chat-messages'); // Get the chat container
        const botMessageDiv = document.createElement('div');  // Create the bot message div
        botMessageDiv.classList.add('message', 'bot');      // Add the classes
        chatContainer.append(botMessageDiv);           // Append to the chat

        story = '';

        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story) {
                    addConversation('assistant', story, false, false)
                    toggleAnimation(true)
                }
                break;
            }

            const textDecoder = new TextDecoder('utf-8');
            const chunk = textDecoder.decode(value);
            // Parse the SSE stream
            chunk.split('\n').forEach(part => {
                if (part.startsWith('data: ')) {
                    try {
                        let jsonData = JSON.parse(part.substring('data: '.length));
                        if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
                            story += jsonData.candidates?.[0]?.content?.parts?.[0]?.text;
                        }
                    } catch (error) {
                        addWarning(error, false);
                        console.error("Error:", error);
                    }
                }
            });
            if (first_response) {
                first_response = false;
                toggleAnimation(true);
                botMessageDiv.scrollIntoView();
            }
            if (story) {
                botMessageDiv.innerHTML = converter.makeHtml(story);
            }
            hljs.highlightAll();
        }

    } catch (error) {
        console.error("Error:", error);
        addWarning('Error: ' + error.message)
        toggleAnimation(true);
        enableChat();
    } finally {
        enableCopyForCode();
        enableChat();
        toggleAnimation(true)
    }
} // geminiStreamChat


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function processDataPart(part) {
    let jsonData;
    if (chosen_platform === 'anthropic') {
        jsonData = JSON.parse(part.substring('event: content_block_delta'.length + 6));
        if (jsonData.delta?.text) {
            story += jsonData.delta.text;
        }
    } else {
        jsonData = JSON.parse(part.toString().substring('data: '.length));
        if (chosen_platform === 'cohere') {
            if (jsonData.delta?.message?.content?.text) {
                story += jsonData.delta.message.content.text;
            }
        } else {
            if (jsonData.choices?.[0]?.delta?.content) {
                story += jsonData.choices[0].delta.content;
            }
        }
    }
}


function processFullData(jsonData) {
    if (chosen_platform === 'anthropic') {
        if (jsonData.content?.[0].text) {
            story += jsonData.content[0].text;
        }
    } else {
        if (chosen_platform === 'cohere') {
            if (jsonData.message?.content?.[0]?.text) {
                story += jsonData.message.content[0].text;
            }
        } else {
            if (jsonData.choices?.[0]?.message?.content) {
                story += jsonData.choices[0].message.content;
            }
        }
    }
}

function processBuffer(remainingBuffer) {
    if (remainingBuffer.trim().length > 0) {
        try {
            processDataPart(remainingBuffer);
        } catch (error) {
            console.error('Error processing final buffer', error);
            addWarning(JSON.stringify(error));
        }
    }
}

function enableGoogleCse() {
    let g_api_key = document.querySelector("#cse_google_api_key")?.value.trim() ?? '';
    let g_cx_id = document.querySelector("#cse_google_cx_id")?.value.trim() ?? '';
    if (g_api_key && g_cx_id) {
        localStorage.setItem('cse_google_api_key', g_api_key)
        localStorage.setItem('cse_google_cx_id', g_cx_id)
        closeDialogs();
        addWarning('Google CSE successfully defined!', true, 'success_dialog');
    } else {
        addWarning("Error: API Key and/or CX ID not defined for Google Custom Search", true, 'fail_dialog')
    }
}

function disableGoogleCse() {
    localStorage.removeItem('cse_google_api_key')
    localStorage.removeItem('cse_google_cx_id')
    let disable_g_cse = document.querySelector("#disable_g_cse");
    if (disable_g_cse) {
        disable_g_cse.remove();
    }
    closeDialogs();
}

function isGoogleCseActive() {
    let g_api_key = localStorage.getItem('cse_google_api_key')
    let g_cx_id = localStorage.getItem('cse_google_cx_id')
    return !!(g_api_key && g_cx_id);

}

async function gcseActive() {
    return isGoogleCseActive();
}


async function googleSearch(data) {
    let is_cse_active = await isGoogleCseActive();
    if (!is_cse_active) {
        let cse_opt = `<button class="more_opt_btn" onclick="moreOptions('cse')">See Options</button>`;
        cse_opt = `<p>You need activate Google CSE to use this feature!</p> <p>${cse_opt}</p>`;
        cse_opt += "<p>Once enabled, simply type: <code><span class='hljs-meta'>s: question</span></code> or <code><span class='hljs-meta'>search: question</span></code> where <span class='hljs-meta'>question</span> is the question the AI will answer based on the results from the web.</p>";
        addWarning(cse_opt, false, 'dialog_warning');
        toggleAnimation(true)
        return false;
    }

    let term = data.term ?? '';
    if (!term) {
        addWarning('googleSearch() received no search param');
    }
    console.log('Searching for ' + term);
    let gs = new GoogleSearch();
    let results = await gs.search(term);
    let txt_result = '';
    if (results.items) {
        results.items.forEach(item => {
            txt_result += `\n- **Title**: ${item.title}\n- **Snippet**: ${item.snippet}\n\n`;
        })
    } else {
        if (is_cse_active) {
            addWarning('Got no result from Google Search');
        }
        removeLastMessage();
        toggleAnimation();
        return false;
    }
    //  let last_input = conversations.messages[conversations.messages.length - 1].content;

    let last_input = last_user_input.replace(/^[a-z]+:(.*?)\s/i, " "); // remove cmd
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        let cnt = `${last_input} <details><summary>Search Results [${term}]: </summary>${txt_result}</details>`;
        ele.innerHTML = converter.makeHtml(cnt);
    }

    conversations.messages[conversations.messages.length - 1].content = `User prompt: ${last_input} \n respond based on this context: <details><summary>Search Results [${term}]: </summary>${txt_result}</details>`;
    if (chosen_platform === 'google') {
        await geminiChat()
        toggleAnimation(true);
    } else {
        await streamChat(false); // false to prevent infinite loop
        toggleAnimation(true);

    }

}

function toolHandle(data) {
    if (chosen_platform === 'google') {
        try {
            let fn_name = data.name;
            let arguments = data.args;
            this[fn_name](arguments);
        } catch (error) {
            console.log(error)
        }
    } else if (chosen_platform === 'anthropic') {
        if (data.content?.[0]) {
            let fn_name = data.content[0].name;
            let arguments = data.content[0].input;
            this[fn_name](arguments);
        } else {
            addWarning('A tool was expected, got none.', false)
        }
    } else if (chosen_platform === 'cohere') {
        if (data.message?.tool_calls?.[0]?.function) {
            let fn_name = data.message.tool_calls[0]?.function.name
            let arguments = JSON.parse(data.message.tool_calls[0]?.function.arguments)
            this[fn_name](arguments);
        } else {
            addWarning('A tool was expected, got none.', false)
        }
    } else {
        if (data.choices?.[0]?.message?.tool_calls?.[0]?.function) {
            let tool = data.choices[0].message.tool_calls[0].function;
            let fn_name = tool.name;
            let arguments = JSON.parse(tool.arguments);
            this[fn_name](arguments);
        } else {
            addWarning('A tool was expected, got none.', false)
        }
    }
}

let start_msg = document.querySelector(".start_msg");
let doc_title = document.title;
start_msg.onmouseover = () => {
    document.title = model + ' -> ' + chosen_platform;
    start_msg.title = document.title;
}
start_msg.onmouseleave = () => {
    document.title = doc_title;
    start_msg.removeAttribute('title');
}

chatButton.onmouseover = () => {
    document.title = 'Send to ' + model + ' -> ' + chosen_platform;
}
chatButton.onmouseleave = () => {
    document.title = doc_title;
}


