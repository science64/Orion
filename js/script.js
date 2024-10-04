let can_delete_history = false;
let max_chats_history = 50;
let chosen_platform = localStorage.getItem('chosen_platform');
let model = localStorage.getItem('selected_model');
let api_key = localStorage.getItem(`${chosen_platform}.api_key`)


let endpoint = localStorage.getItem('endpoint')


let SITE_TITLE = "OrionChat";

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
    cerebras: {
        models: [
            "llama3.1-8b",
            "llama3.1-70b"
        ],
        name: "Cerebras",
        endpoint: "https://api.cerebras.ai/v1/chat/completions"
    },
    groq: {
        models: [
            "llama-3.2-90b-text-preview",
            "llama-3.1-70b-versatile",
            "llama3-70b-8192",
            "mixtral-8x7b-32768",
            "llama-3.2-11b-vision-preview",
            "llama3-groq-8b-8192-tool-use-preview",
            "llama-3.2-11b-text-preview",
            "gemma2-9b-it",
            "llava-v1.5-7b-4096-preview",
            "llama3-groq-70b-8192-tool-use-preview"
        ],
        name: "Groq",
        endpoint: "https://api.groq.com/openai/v1/chat/completions"
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
            "claude-3-5-sonnet-20240620",
            "claude-3-opus-20240229",
            "claude-3-haiku-20240307"
        ],
        name: "Anthropic",
        endpoint: "https://api.anthropic.com/v1/messages"
    },
    ollama: {
        models: [],
        name: "Ollama",
        get_models_endpoint: "http://localhost:11434/v1/models",
        endpoint: "http://localhost:11434/v1/chat/completions"
    }
}
//console.log(PLATFORM_DATA);

const language_extension = {
    "python": "py",
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

showdown.setFlavor('github');
showdown.setOption('ghMentions', false); // se true @algo se torna em github.com/algo
showdown.setOption("openLinksInNewWindow", true);
var converter = new showdown.Converter();

let conversations = {
    'messages': []
};

function addConversation(role, content) {
    closeDialogs();
    let new_talk = {'role': role, 'content': content};
    conversations.messages.push(new_talk);
    //chat_textarea.focus();
    let cnt;
    let div = document.createElement('div');
    div.classList.add('message');
    if (role === 'user') {
        div.classList.add('user');
        cnt = content;
        div.innerText = cnt;

    } else {
        div.classList.add('bot');
        cnt = converter.makeHtml(content);
        div.innerHTML = cnt;

    }
    document.querySelector('#chat-messages').append(div);
    if(role === 'assistant' && content.length > 2){
        genAudio(content, div);
    }
    div.scrollIntoView();
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
            let topic = JSON.parse(localStorage.getItem(id)).messages[0].content ?? '';
            let last_interaction = JSON.parse(localStorage.getItem(id)).last_interact ?? id;
            if (topic) {
                all_topics.push({'topic': topic, 'id': id, 'last_interaction': last_interaction});
            }
        } catch (error) {
            console.log('Error parser to JSON: ' + error)
        }
    });
    return all_topics;
}

function removeChat(div, id) {
    if (can_delete_history) {
        localStorage.removeItem(id);
        let ele = document.createElement('div');
        let content = document.querySelector(".container");
        ele.classList.add('chat_deleted_msg');
        if (parseInt(id) === chat_id) {
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
    new_url = new_url.split('?')[0]; // remove param if have some
    new_url = new_url.split("#")[0]; // remove # if have
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
    new_url = new_url.split('?')[0]; // remove param if have some
    new_url = new_url.split("#")[0]; // remove # if have
    new_url += "#" + old_talk_id;
    history.pushState({url: new_url}, '', new_url);

    let past_talk = localStorage.getItem(old_talk_id); // grab the old conversation

    localStorage.removeItem(old_talk_id); // remove old conversation from localstorage
    //chat_id = new Date().getTime(); // renew ID
    let last_interaction_id = new Date().getTime();

    //let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");
    let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");

    //btn_star_old_chat.setAttribute("data-id", chat_id);
    btn_star_old_chat.setAttribute("data-last-interaction", last_interaction_id);
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
                div_talk.innerText = msg.content;
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
    enableCopyForCode();

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
        //console.log(all_topics);
        let div = document.createElement('div');
        let divWrap = document.createElement('div');
        div.classList.add('topic');
        div.classList.add('truncate');
        if (can_delete_history) {
            div.classList.add('deletable')
        }
        div.textContent = prev.topic.substring(0, 50);

        div.setAttribute('data-id', prev.id)
        div.setAttribute('data-last-interaction', prev.last_interaction)
        div.addEventListener('click', () => {
            let the_id = div.getAttribute('data-id');
            if (can_delete_history) {
                removeChat(div, the_id);
            } else {
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
    let all_parts = [];
    let invalid_key = false;
    let system_prompt_text = getSystemPrompt();
    if (system_prompt_text) {
        let system_prompt = {content: system_prompt_text, 'role': 'system'};
        if (chosen_platform !== 'anthropic') {
            all_parts.push(system_prompt);
        }
    }
    conversations.messages.forEach(part => {
            //let role = part.role === 'assistant' ? 'model' : part.role;
            let cnt = part.content;
            if (chosen_platform === 'anthropic') {
                let ant_part =
                    {
                        role: part.role,
                        content: [{type: 'text', text: cnt}]
                    }
                all_parts.push(ant_part);
            } else {
                all_parts.push({content: part.content, role: part.role});
            }

        }
    )
//max_tokens: 1024,
    let data =
        {
            model: model,
            stream: false,
            messages: all_parts,
            //  temperature: 0,
            // max_tokens: -1,
            //seed: 0,
            //top_p: 1
        }
    if (chosen_platform === 'anthropic') {
        data.system = system_prompt_text;
        data.max_tokens = 4096
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

    fetch(endpoint, requestOptions)
        .then(response => response.json())
        .then(data => {
            let response_cnt = data.choices?.[0]?.message.content ?? '';
            if (!response_cnt) {
                response_cnt = data.content?.[0]?.text ?? ''; // anthropic
            }
            if (!response_cnt) {
                let the_code = data.code ?? data.error?.code ?? data.error?.message ?? '';
                if (the_code === "wrong_api_key" || the_code === "invalid_api_key" || the_code === "invalid x-api-key") {
                    invalid_key = true;
                    setTimeout(() => {
                        addWarning(data, false)
                    }, 1000)
                } else {
                    addWarning(data, false);
                }
                removeLastMessage()
            } else {
                addConversation('assistant', response_cnt);
            }
        })
        .catch(error => {
            console.log(error);
            addWarning("Error: " + error);
            removeLastMessage()
        })
        .finally(() => {
            toggleAnimation();
            enableChat();
            if (invalid_key) {
                setApiKeyDialog();
            }
            hljs.highlightAll();
            enableCopyForCode();
        })
}

function removeLastMessage() {
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        document.querySelector(".chat-input textarea").value = ele.innerText;
        conversations.messages.pop();
        if (conversations.messages.length) {
            localStorage.setItem(chat_id, JSON.stringify(conversations));
        } else {
            localStorage.removeItem(chat_id);
        }
        ele.remove();
    }
}

let chatButton = document.querySelector(".chat-input button");
let chat_textarea = document.querySelector(".chat-input textarea");

function startChat() {
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


function addWarning(msg, self_remove = true) {
    if (!(msg instanceof String)) {
        msg = JSON.stringify(msg);
    }
    let duration = 0;
    if (self_remove) {
        duration = 7;
    }
    createDialog(msg, duration, self_remove)
    // let divMother = document.createElement('div');
    // divMother.classList.add('popup');
    // let div = document.createElement('div');
    // div.classList.add('warning');
    // div.innerHTML = msg;
    // document.querySelector(".container").append(divMother);
    // if (self_remove) {
    //     setTimeout(() => {
    //         divMother.remove();
    //     }, 5000);
    // } else {
    //     let close_warning = document.createElement('span');
    //     close_warning.classList.add('close_warning');
    //     div.append(close_warning);
    //     close_warning.onclick = (() => {
    //         divMother.remove();
    //     })
    // }
    // divMother.append(div);

}


function disableChat() {
    // chat_textarea.disabled = true;
}

function enableChat() {
    chat_textarea.disabled = false;
    // chat_textarea.focus();
}

function toggleAnimation() {
    let loading = document.querySelector("#loading")
    if (loading.style.display === 'inline-flex') {
        loading.style.display = 'none';
    } else {
        loading.style.display = 'inline-flex';
    }
}

chat_textarea.onkeyup = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        startChat();
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
        if (!block.querySelector(".copy-btn")) {   // to not be added more the one time
            const button = document.createElement('button');
            const div_ele = document.createElement('div');
            div_ele.className = 'btn-group';
            button.className = 'copy-btn';
            button.innerText = 'Copy';
            const btn_down = button.cloneNode(false);
            btn_down.className = 'down-btn';
            btn_down.innerText = 'Down';
            div_ele.append(button);
            if(enable_down_too){
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

   if(enable_down_too){
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
                let extension = language_extension[lang_name] ?? 'txt';
                let ai_full_text = btn.parentElement.parentElement.parentElement.innerHTML;
                let file_name = ai_full_text.match(new RegExp(`([a-zA-Z0-9_-]+\\.${extension})`, 'g'));
                let more_than_one = btn.parentElement.parentElement.parentElement.querySelectorAll("." + lang_name);
                // more_then_one = more than one code with the same extension
                if (file_name) {
                    file_name = file_name[0];
                    if (more_than_one.length >= 2) {
                        file_name = 'file.' + extension;
                        // can't determine precisely the file name(because have two or more), so file_name will be default to file.ext
                    }
                } else {
                    file_name = 'file.' + extension; // change
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

function geminiChat() {
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

    const data = {
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
                    text = data.candidates[0].content.parts[0].text;
                } catch {
                    text = '<pre>' + JSON.stringify(data) + '</pre>';
                    try {
                        // Verify if it is an error with the api key being not valid
                        let tt = data.error.message;
                        if (tt.match(/API key not valid/)) {
                            invalid_key = true;
                        }
                    } catch {
                        console.log('Ops error, no: data.error.message')
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
        }).finally(() => {
        toggleAnimation();
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
         <input id="set_api_key" type="password" name="api_key" placeholder="Your API key">
         <button onclick="setApiKey()">Save</button>
         <div>
         <p>You can get free API Key from Google Gemini and Groq Inc.</p>
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
    if(typeof(all_prompts) !== "undefined"){
        prompts_options += '<select name="prompt"><option selected="selected" disabled="disabled">Awesome Prompts</option>';
        all_prompts.forEach(the_prompt=>{
            let prompt_text = the_prompt.prompt.replace(/"/g, '&quot;');
            prompts_options += `<option id="prompt_id${prompt_id}" value="${prompt_text}">${the_prompt.act}</option>`;
            prompt_id++;
        });
        prompts_options +='</select>';
    }
    let platform_info = '';
    let platform_name = '';
    if (chosen_platform) {
        platform_name = PLATFORM_DATA[chosen_platform].name ?? '';
        platform_info = `<p class="platform_info">Active:<b> ${model}</b> from <b>${platform_name}</b></p>`;
    }
    let platform_options = '<div><p>Choose a Model</p><select name="platform">';
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

    let disable_audio_option = '';
    let is_audio_feature_active = localStorage.getItem('audio_feature')
    is_audio_feature_active = parseInt(is_audio_feature_active);
    let is_eleven_keys_set = localStorage.elabs_api_key ?? '';
    if(is_audio_feature_active){
        disable_audio_option = `<p><b>Audio active:</b> <button class="red_btn" onclick="disableAudioFeature()">Disable Audio</button></p>`;
    }else {
        if(is_eleven_keys_set){
            disable_audio_option = `<p><b>Audio is disabled:</b> <button onclick="enableAudioFeature()">Enable Audio</button></p>`;
        }
    }
    let audio_options =
        `<hr><p>If you want an audio response, you can set up an API key for ElevenLabs below.</p>
         <input type="password" name="elabs_api_key" placeholder="ElevenLabs API Key">
         <button onclick="enableAudioFeature()">Save Key</button>
        `;
    let cnt =
        `<div>${platform_options}
         <input type="password" name="api_key" placeholder="API Key(if not defined yet)">
         <button onclick="saveModel()">Save Model</button></div><hr>
         <div><strong>System Prompt</strong>
         ${prompts_options}
         <textarea class="system_prompt" placeholder="(Optional) How the AI should respond?">${system_prompt}</textarea>
         <button onclick="savePrompt()" class="save_prompt">Save Prompt</button>
         ${platform_info}
         ${audio_options}
         ${disable_audio_option}
         </div>`;
    createDialog(cnt, 0, 'optionsDialog');
    setTimeout(()=>{
        let sl_prompt = document.querySelector("select[name=prompt]");
        if(sl_prompt){
            sl_prompt.onchange = (item=>{
               let txt_area =  document.querySelector("textarea.system_prompt");
               if(txt_area){
                   txt_area.innerText = item.target.value;
                   txt_area.style.backgroundColor = '##0d13fe78';
                   setTimeout(()=>{
                       txt_area.style.backgroundColor ='transparent';
                   },1000)
               }
            })
        }
    },500)

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
    let sys_prompt = document.querySelector("textarea.system_prompt").value.trim();
    if (sys_prompt.length) {
        localStorage.setItem('system_prompt', sys_prompt);
    }
    saveModel();
    closeDialogs();
}

function saveModel() {
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
    if(!api_key && chosen_platform ==='ollama'){
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
    document.querySelector('.conversations').style.display = 'block';

}

if (!api_key) {
    let open_options = document.querySelector("#open_options");
    open_options.click();
}

let page_chat_id = document.URL.split("#")[1];
let current_chat = document.querySelector("[data-id='" + page_chat_id + "']");

if (current_chat) {
    current_chat.click();
}

orderTopics();


function ollamaGuide() {
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
Environment=OLLAMA_ORIGINS=https://eliaspereirah.github.io</code></pre>
  <p><br>This will allow <strong>https://eliaspereirah.github.io</strong> to access http://localhost:11434/</p>
</div>`

createDialog(guide,0,'cl_justify')
    hljs.highlightAll();
    setTimeout(()=>{
        enableCopyForCode(false);
    },500)

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
                if(optgroup_ollama){
                    optgroup_ollama.append(option_element)
                }
                PLATFORM_DATA.ollama.models.push(ollama_model.id);
            })
        }).catch(error => {
            //console.error('Error: ' + error)
            let end_time = new Date().getTime()
            let past_time = end_time - start_time;
            if (past_time > 1200) {
                //console.log("user don't seems to have ollama running");
            } else {
               console.log('user seems to have ollama running with cors policy')
                let guide_warnings = localStorage.getItem('guide_warnings');
                if(!guide_warnings){
                    guide_warnings = 0;
                }
                guide_warnings = parseInt(guide_warnings);
                guide_warnings++
                if(guide_warnings <= 4){
                    ollamaGuide();
                }
                localStorage.setItem('guide_warnings', guide_warnings.toString());
            }
        }
    )
}

getOllamaModels();

function disableAudioFeature(){
    localStorage.setItem('audio_feature','0');
    addWarning('Audio feature disabled',true)
}

function enableAudioFeature(){
    localStorage.setItem('audio_feature','1');
    let input_ele = document.querySelector("input[name=elabs_api_key]");
    if(input_ele && input_ele.value.trim().length > 5){
        elabs_api_key = input_ele.value.trim();
        localStorage.setItem('elabs_api_key', elabs_api_key)
        addWarning('Audio feature enabled',true)
    }else {
        if(!elabs_api_key){
            addWarning('Ops. No key provided!', false)
        }else {
            addWarning('Audio feature enabled',true)
        }
    }

}