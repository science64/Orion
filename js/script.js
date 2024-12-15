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
let last_auto_yt_fn_call = 0;
let is_chat_enabled = true;
let SITE_TITLE = "Orion";
let js_code = '';
let js_code_exec_finished = true;
let js_code_exec_output = '';
let original_code = '';
let temp_safe_mode = false;
let pre_function_text = '';
let azure_endpoint = localStorage.getItem('azure_endpoint');
// Markdown to HTML
showdown.setFlavor('github');
showdown.setOption('ghMentions', false); // if true "@something" became github.com/something
showdown.setOption("openLinksInNewWindow", true);
let converter = new showdown.Converter();


let PLATFORM_DATA = {
    openai: {
        models: [
            "gpt-4o",
            "gpt-4o-mini",
            "o1-preview",
            "o1-mini"
        ],
        name: "OpenAI",
        endpoint: "https://api.openai.com/v1/chat/completions"
    },
    google: {
        models: [
            "gemini-2.0-flash-exp",
            "gemini-exp-1206",
            "learnlm-1.5-pro-experimental",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b"
        ],
        name: "Google",
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{{model}}:{{gen_mode}}?key={{api_key}}'
    },
    anthropic: {
        models: [
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            "claude-3-haiku-20240307"
        ],
        name: "Anthropic",
        endpoint: "https://api.anthropic.com/v1/messages"
    },
    cohere: {
        models: [
            "command-r-plus-08-2024",
            "command-r-plus-04-2024",
            "c4ai-aya-expanse-32b",
            "c4ai-aya-23-35b",
            "command-light"
        ],
        name: "Cohere",
        endpoint: "https://api.cohere.com/v2/chat"
    },
    groq: {
        models: [
            "llama-3.3-70b-versatile",
            "llama-3.2-90b-vision-preview",
            "llama3-groq-70b-8192-tool-use-preview",
            "llama-3.3-70b-specdec",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ],
        name: "Groq",
        endpoint: "https://api.groq.com/openai/v1/chat/completions"
    },
    sambanova: {
        models: [
            "Qwen2.5-Coder-32B-Instruct",
            "Meta-Llama-3.1-405B-Instruct",
            "Llama-3.2-90B-Vision-Instruct"
        ],
        name: "SambaNova",
        endpoint: "https://api.sambanova.ai/v1/chat/completions"

    },
    cerebras: {
        models: [
            "llama3.1-8b",
            "llama3.1-70b"
        ],
        name: "Cerebras",
        endpoint: "https://api.cerebras.ai/v1/chat/completions"
    },
    xai: {
        models: [
            "grok-beta"
        ],
        name: "xAI",
        endpoint: "https://api.x.ai/v1/chat/completions"
    },
    ollama: {
        models: [],
        name: "Ollama",
        get_models_endpoint: "http://localhost:11434/v1/models",
        endpoint: "http://localhost:11434/v1/chat/completions"
    },
    /* nvidia: {
         models: [
             "meta/llama-3.1-405b-instruct",
             "nvidia/llama-3.1-nemotron-70b-instruct"
         ],
         name: "NVIDIA",
         endpoint: "https://integrate.api.nvidia.com/v1/chat/completions"
     }*/
}


if (azure_endpoint) {
    PLATFORM_DATA.azure = {
        models: [
            "gpt-4o-mini"
        ],
        name: "Azure",
        endpoint: azure_endpoint
    };
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
    //localStorage.setItem("hide_conversations", '0');
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

    setOptions();
}


let new_chat = document.querySelector("#new_chat");
new_chat.addEventListener('click', () => {
    newChat(); // start new chat
})

jsClose = document.querySelector(".jsClose");
jsClose.onclick = () => {
    document.querySelector('.conversations').style.display = 'none';
    //localStorage.setItem("hide_conversations", '1');
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
        if (temp_safe_mode) {
            div.innerText = cnt;
        } else {
            div.innerHTML = cnt;
        }
        temp_safe_mode = false;
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
            if (temp_safe_mode) {
                div.innerText = cnt;
            } else {
                div.innerHTML = cnt;
            }
            temp_safe_mode = false;
            genAudio(content, div);
        } else {
            let lastBot = document.querySelectorAll(".bot")[document.querySelectorAll(".bot").length - 1];
            genAudio(content, lastBot);
        }

    }
    document.querySelector('#chat-messages').append(div);
    mediaFull();
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
                addWarning(alert_msg, false)
                div.classList.add('del_caution')
                return false;
            }
        }
        document.querySelectorAll(".del_caution").forEach((dc => {
            dc.classList.remove('del_caution');
        }))

        document.querySelectorAll(".confirm_deletion").forEach((cd => {
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
    toggleAnimation(true);
    document.title = SITE_TITLE;
    chat_id = new Date().getTime(); // generate a new chat_id
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    new_url += "#" + chat_id;
    history.pushState({url: new_url}, '', new_url);
    removeScreenConversation();
    conversations.messages = []; // clean old conversation


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
    let system_prompt = localStorage.getItem('system_prompt');
    if (!system_prompt) {
        return system_prompt;
    }
    let today = whatTimeIsIt();
    system_prompt = system_prompt.replaceAll("{{date}}", today);
    system_prompt = system_prompt.replaceAll("{{lang}}", navigator.language)
    return system_prompt;
}

function chat() {
    if (chosen_platform === 'google') {
        // endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        return geminiChat();
    }
    return streamChat();
}


/**
 * Remove the last message in the chat
 * if from_user = true will remove just messages from the user
 **/
function removeLastMessage(from_user = true) {
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (!ele.classList.contains('user') && from_user) {
        return false;
    }
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
        //addWarning('Chat is busy. Please wait!');
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
            button.title = "Copy code";
            const btn_down = button.cloneNode(false);
            btn_down.className = 'down-btn';
            btn_down.innerText = 'Down';
            btn_down.title = "Download code";
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
    enableFullTextCopy();
}





function enableFullTextCopy() {
    document.querySelectorAll('.chat .bot').forEach(div => {
        let div_copy = document.createElement('div');
        div_copy.innerHTML = div.innerHTML;
        let btn_groups = div_copy.querySelectorAll(".btn-group");
        btn_groups.forEach(btn => {
            // So that it is not copied along with the text
            btn.remove();
        })

        let all_ele = div_copy.querySelectorAll("*");
        all_ele.forEach(element=>{
            element.removeAttribute('id');
        })

        let play_audio_btn = div_copy.querySelector(".play_audio_btn");
        if(play_audio_btn){
            // So that it is not copied along with the text
            play_audio_btn.remove();
        }

        let has_copy_btn = div.classList.contains('has_full_text_copy_btn')
        if (!has_copy_btn) {   // to not be added more the one time
            const button = document.createElement('button');
            const ele = document.createElement('div');
            ele.className = 'btn-ft-group';
            button.className = 'copy-btn';
            button.innerText = 'Copy text';
            ele.append(button);
            div.append(ele);
            button.addEventListener('click', () => {
                const full_text = div_copy.innerHTML;
                navigator.clipboard.writeText(full_text)
                    .then(() => {
                        button.innerText = 'Copied!';
                        setTimeout(() => button.innerText = 'Copy text', 2000);
                    })
                    .catch(err => console.error('Error:', err));
            });
            div.classList.add('has_full_text_copy_btn');
        }
    });

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
        data.contents[0].pop(); // remove the last input - something like cmd: prompt

        // add the last input but without the "cmd:", just the prompt
        // note: cmd variable will be clean at this point
        data.contents[0].push({
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
        let tool_compatibility = `google_compatible`;
        let the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
        if (the_tool) {
            with_stream = false; // in this case for tool use we will not use stream mode
            data.tools = [the_tool];
            data.toolConfig = {
                "functionCallingConfig": {
                    "mode": "ANY"
                }
            };
        }
    }

    if (!data.tools) {
        if (last_user_input.match(/^py:|python:/)) {
            // code execution command
            data.tools = [{'code_execution': {}}];
        }
    }


    if (with_stream) {
        return geminiStreamChat(fileUri, data);
    }

//    let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${{model}}:generateContent?key=${{api_key}}`
    let gemini_endpoint = endpoint.replaceAll("{{model}}", model);
    gemini_endpoint = gemini_endpoint.replaceAll("{{api_key}}", api_key);
    gemini_endpoint = gemini_endpoint.replaceAll("{{gen_mode}}", "generateContent");

    let invalid_key = false;
    fetch(gemini_endpoint, {
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
            let text = '';
            if (typeof data === "object") {
                try {
                    text = data.candidates[0].content.parts[0]?.text ?? '';
                    let g_tool = data.candidates[0].content.parts[0]?.functionCall ?? '';
                    if (g_tool === '') {
                        g_tool = data.candidates[0].content.parts[1]?.functionCall ?? '';
                    }
                    if (g_tool) {
                        pre_function_text = text;
                        toolHandle(g_tool);
                    }
                    if (!text && !g_tool) {
                        addWarning('Error: Unexpected response', true, 'fail_dialog')
                    }

                    let finished_reason = data.candidates[0].finishReason ?? '';
                    if (finished_reason && finished_reason !== 'STOP') {
                        setTimeout(() => {
                            addWarning('finishReason: ' + finished_reason, false, 'fail_dialog')
                        }, 500)
                    }

                } catch {
                    text += '<pre>' + JSON.stringify(data) + '</pre>';
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
            if (text !== '') {
                addConversation('assistant', text);
            }

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


function ragEndpointDialog() {
    let use_rag = localStorage.getItem('use_rag_endpoint');
    let disable_advanced_rag = '';
    if (use_rag === 'yes' || use_rag == null) {
        disable_advanced_rag = `
             <div><p><b class="beta_warning">Warning</b> If you no longer wish to use or see this alert, click disable.</p>
             <button onclick="disableRag()">Disable</button></div>`;
    }
    let cnt =
        `<div>
          <p>Configure an endpoint for advanced search.</p>
         </div>
         <input id="set_rag_endpoint" type="text" name="set_rag_endpoint" placeholder="RAG endpoint">
         <button onclick="saveRagEndpoint()">Activate</button>
         <div>
         ${disable_advanced_rag}
         <p>Learn more about this feature here:
          <a href="https://github.com/EliasPereirah/OrionChat#rag-endpoint">RAG endpoint</a></p>
         </div>`;
    createDialog(cnt, 0, 'optionsDialog');
}

function disableRag() {
    localStorage.setItem('use_rag_endpoint', 'no');
    closeDialogs();
}

function saveRagEndpoint(activate) {
    let input_ele = document.querySelector('#set_rag_endpoint');
    if (input_ele) {
        let rag_endpoint = input_ele.value.trim();
        if (rag_endpoint) {
            localStorage.setItem("rag_endpoint", rag_endpoint)
            localStorage.setItem('use_rag_endpoint', 'yes');
        }
    }
    closeDialogs()
}

function setOptions() {
    closeDialogs(); // close opened dialogs before show options dialog
    let system_prompt = localStorage.getItem('system_prompt');
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

    let plugin_option = `<button class="plugin_opt_btn" onclick="pluginOptions()">Plugins</button>`;
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
         <p>${plugin_option}</p>
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

function loadPlugins() {
    let plugin_url = localStorage.getItem("plugin_url");
    if (plugin_url) {
        let sc = document.createElement('script');
        sc.src = plugin_url.trim();
        document.body.append(sc);
    }
    let plugin_code = localStorage.getItem("plugin_code");
    if (plugin_code) {
        let sc_inline = document.createElement('script');
        sc_inline.innerHTML = plugin_code.trim();
        document.body.append(sc_inline);

    }
}

function savePlugin() {
    let plugin_url = document.querySelector("#plugin_url");
    let plugin_code = document.querySelector("#plugin_code");
    if (plugin_code && plugin_code.value.trim()) {
        plugin_code = plugin_code.value.trim();
        if (plugin_code) {
            localStorage.setItem("plugin_code", plugin_code);
        }
    } else {
        localStorage.removeItem("plugin_code");
    }
    if (plugin_url && plugin_url.value.trim()) {
        plugin_url = plugin_url.value.trim();
        if (plugin_url) {
            localStorage.setItem('plugin_url', plugin_url)
        }
    } else {
        localStorage.removeItem("plugin_url");
    }
    closeDialogs();
}

function pluginOptions() {
    closeDialogs(); // close opened dialogs before show options dialog
    let plugin_url = localStorage.getItem("plugin_url")
    let plugin_code = localStorage.getItem("plugin_code");
    let value_plugin_code = '';
    if (plugin_code) {
        value_plugin_code = `${plugin_code}`;
    }

    let value_plugin_url = '';
    if (plugin_url) {
        value_plugin_url = `value="${plugin_url}"`;
    }
    let cnt =
        `<div>
         <p>Add new functionality by adding a script.</p>
         <input ${value_plugin_url} placeholder="JavaScript URL" type="url" id="plugin_url">
         <p>and/or code</p>
         <textarea placeholder="JavaScript code" id="plugin_code">${value_plugin_code}</textarea>
         <p><button onclick="savePlugin()">Save Plugin</button></p>
         </div>`;

    createDialog(cnt, 0, 'optionsDialog');
}// end addPlugin


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

    let rag_options = `
             <div><hr>
             <p>For a more efficient RAG configure advanced search</p>
             <button onclick="ragEndpointDialog()">Advanced</button>
             </div>`;

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
         ${rag_options}
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


function setYouTubeCaptionApiEndpoint() {
    let ele = document.querySelector("#yt_down_caption_endpoint");
    if (ele) {
        let yt_down_caption_endpoint = ele.value.trim();
        localStorage.setItem('yt_down_caption_endpoint', yt_down_caption_endpoint);
    }
    closeDialogs();
}

function dialogSetYouTubeCaptionApiEndpoint() {
    let cnt =
        `
        <p>Configure a YouTube caption extraction API endpoint.</p>
        <input id="yt_down_caption_endpoint" name="yt_down_caption_endpoint" placeholder="API Endpoint">
        <button onclick="setYouTubeCaptionApiEndpoint()">Save</button>
        <p>This will allow you to share a YouTube URL, and the AI will respond based on the caption of the shared video.</p>`
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
    //  document.querySelector('.conversations').style.display = 'none';
} else {
    if (!is_mobile) {
        //  document.querySelector('.conversations').style.display = 'block';
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
        console.log('User seems to be on a mobile device')
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
        if (audio_txt_status) {
            audio_txt_status.innerText = 'Audio is enabled!'
        }
    } else {
        if (!elabs_api_key) {
            addWarning('Ops. No key provided!', false)
        } else {
            addWarning('Audio feature enabled', true)
            if (audio_txt_status) {
                audio_txt_status.innerText = 'Audio is enabled!'
            }
        }
    }

}


function needToolUse(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0];
    let cmd_list = [
        'search:', 's:',
        'javascript:', 'js:',
        'youtube:', 'yt:'
    ]
    if (cmd_list.includes(cmd)) {
        return true;
    } else if (last_user_input.match(/youtube\.com|youtu\.be/)) {
        let time_now = new Date().getTime();
        let past_seconds = (time_now - last_auto_yt_fn_call) / 1000;
        if (past_seconds > 10) {
            last_auto_yt_fn_call = time_now;
            return true
        }
    }
    return false;
}

function whichTool(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0] ?? '';
    if (cmd === "search:" || cmd === 's:') {
        return 'googleSearch';
    } else if (cmd === 'javascript:' || cmd === 'js:') {
        return 'javascriptCodeExecution';
    } else if (cmd === 'youtube:' || cmd === 'yt:') {
        return 'youtubeCaption';
    } else if (last_user_input.match(/youtube\.com|youtu\.be/)) {
        return 'youtubeCaption';
    }
    return '';
}

function commandManager(input_text) {
    input_text = input_text.trim() + " ";
    let arr = input_text.match(/^[a-z]+:(.*?)\s/i);
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

    input_text = input_text.replace(/^[a-z]+:(.*?)\s/i, " ").trim();
    prompt = prompt.replaceAll("{{USER_INPUT}}", input_text);

    prompt = prompt.replaceAll("{{ARG1}}", args);
    return prompt; // return the new prompt formated

}


async function youtubeCaption(data) {
    let video_title = '';
    let yt_down_caption_endpoint = localStorage.getItem("yt_down_caption_endpoint") ?? ''
    if (!yt_down_caption_endpoint) {
        dialogSetYouTubeCaptionApiEndpoint();
        removeLastMessage();
        enableChat();
        toggleAnimation(true);
        return false;
    }

    let url = data.url ?? '';
    if (!url) {
        addWarning('youtubeCaption() received no URL param');
    }
    console.log('Extracting caption from ' + url);
    let caption = '';


    const urlencoded = new URLSearchParams();
    urlencoded.append('yt_url', url);
    let data_init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
    }
    await fetch(yt_down_caption_endpoint, data_init).then(function (res) {
        return res.json();
    }).then(function (json) {
        if (json.caption) {
            caption = json.caption;
        }
        if (json.title) {
            video_title = json.title;
        }

    });
    if (caption === '') {
        addWarning('Could not get subtitles for this video', false)
        removeLastMessage();
    } else {
        let last_input = last_user_input.replace(/^[a-z]+:(.*?)\s/i, " "); // remove cmd
        let ele = document.querySelector(".message:nth-last-of-type(1)");
        if (pre_function_text) {
            last_input = pre_function_text;
        }
        let cnt = `${last_input} <details><summary><b>Title</b>: ${video_title}</summary><br><b>Caption</b>: ${caption}</details>`;
        if (ele) {
            ele.innerHTML = cnt;
        }
        pre_function_text = '';
        //   conversations.messages[conversations.messages.length - 1].content = `User prompt: ${last_input} \n the caption of the video: <caption>${caption}</caption>`;
        conversations.messages[conversations.messages.length - 1].content = cnt;
        setTimeout(() => {
            loadVideo()
        }, 1000)
        if (chosen_platform === 'google') {
            await geminiChat()
            toggleAnimation(true);
        } else {
            await streamChat(false); // false to prevent infinite loop
            toggleAnimation(true);
        }

    }


} // youtubeCaption


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
        data.max_tokens = 4096;
        if (system_prompt_text) {
            data.system = system_prompt_text;
        }
    }


    let HTTP_HEADERS = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
        'x-api-key': `${api_key}`, // for Anthropic
        "anthropic-version": "2023-06-01", // for Anthropic
        "anthropic-dangerous-direct-browser-access": "true"
    };

    if (chosen_platform === "azure") {
        HTTP_HEADERS['api-key'] = api_key;
    }
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
                    data.tool_choice = {"type": "tool", "name": tool_name};
                }
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
                            toggleAnimation(true);
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
        toggleAnimation(true);
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
    // const endpoint_stream = `https://generativelanguage.googleapis.com/v1beta/models/${{model}}:streamGenerateContent?alt=sse&key=${{api_key}}`;

    let endpoint_stream = endpoint.replaceAll("{{model}}", model);
    endpoint_stream = endpoint_stream.replaceAll("{{gen_mode}}", "streamGenerateContent");
    endpoint_stream = endpoint_stream.replaceAll("{{api_key}}", api_key + "&alt=sse");

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
                            story += jsonData.candidates[0].content?.parts[0].text;
                        } else if (jsonData.candidates?.[0]?.content?.parts?.[0]?.executableCode?.code) {
                            let code = jsonData.candidates[0].content.parts[0].executableCode.code;
                            let code_lang = jsonData.candidates[0].content.parts[0].executableCode.language;
                            code_lang = code_lang.toLowerCase();
                            code = `<pre><code class="${code_lang} language-${code_lang} hljs code_execution">${code}</code></pre>`;
                            story += code;
                        } else if (jsonData.candidates?.[0]?.content?.parts?.[0]?.codeExecutionResult?.output) {
                            let ce_outcome = jsonData.candidates[0].content.parts[0].codeExecutionResult.outcome; // OUTCOME_OK == success
                            let ce_output = jsonData.candidates[0].content.parts[0].codeExecutionResult.output;
                            ce_output = ce_output.replaceAll("\n","<br>");
                            story += `<div class="code_outcome ${ce_outcome}">${ce_output}</div>`;
                        }

                        let finished_reason = jsonData.candidates[0].finishReason ?? '';
                        if (finished_reason && finished_reason !== 'STOP') {
                            setTimeout(() => {
                                addWarning('finishReason: ' + finished_reason, false, 'fail_dialog')
                            }, 500)
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
        toggleAnimation(true);
        enableChat();
        removeLastMessage();
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
    } else if (results.text) {
        txt_result = results.text;
    } else {
        if (is_cse_active) {
            addWarning('Got no result from Google Search');
        }
        removeLastMessage();
        toggleAnimation();
        enableChat();
        return false;
    }
    //  let last_input = conversations.messages[conversations.messages.length - 1].content;

    let last_input = last_user_input.replace(/^[a-z]+:(.*?)\s/i, " "); // remove cmd
    if (pre_function_text) {
        last_input = pre_function_text;
    }
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        let cnt = `${last_input} <details><summary>Search Results [${term}]: </summary>${txt_result}</details>`;
        ele.innerHTML = converter.makeHtml(cnt);
    }
    pre_function_text = '';

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
            addWarning(data, false);
            // addWarning('A tool was expected, got none.', false)
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

function removeOnlineOfflineMessages(){
    let off_ele = document.querySelectorAll(".offline");
    off_ele.forEach(ele=>{
        ele.remove();
    });

    let on_ele = document.querySelectorAll(".online");
    on_ele.forEach(ele=>{
        ele.remove();
    })
}

window.addEventListener('online', () => {
    removeOnlineOfflineMessages();
    addWarning("You are online again!", false, 'online')
});

window.addEventListener('offline', () => {
    removeOnlineOfflineMessages();
    addWarning("You are offline!", false, 'offline')
});


function javascriptCodeExecution(obj) {
    toggleAnimation(true);
    js_code = obj.code;
    js_code.replace(/\\n/g, "\n")
        .replace(/\\"/g, "'")
        .replace(/\\'/g, "'")
        .replace(/console\.log/g, "")
        .replace(/document\.write/, "")
        .replace("<script>", "")
        .replace("<script", "")
        .replace("</script>", "");
    original_code = obj.code;
    let msg = `The AI want to execute the following code: <div class="center"><button class="accept_code_execution" onclick="executeJsCode(js_code, original_code)">Accept</button></div> <pre class="exclude_btn_group"><code class="javascript language-javascript hljs">${obj.code}</code></pre>`;
    addWarning(msg, false)
    setTimeout(() => {
        hljs.highlightAll();
    }, 500)
}

async function executeJsCode(code, realCode = '') {
    js_code = ''; // reset
    original_code = '' // reset
    let response;
    try {
       // response = await eval(code)
        response = await jsCodeExecutionSandbox(code);
    } catch (error) {
        response = error;
    }
    if (realCode) {
        // code that will be shown
        code = realCode;
    }
   let timer_jc = setInterval(() => {
       if(js_code_exec_finished){
           clearInterval(timer_jc);
           chat_textarea.value = `Executing the following code: <pre><code class="javascript language-javascript hljs">${code}</code></pre>\nGot this output:  <span class="js_output">${js_code_exec_output}</span>`;
           document.querySelector("#send").click();
       }
   })
}


async function jsCodeExecutionSandbox(code) {
    js_code_exec_finished  = false;
    js_code_exec_output = '';
    let old_iframe = document.querySelector("iframe#sandbox");
    if(old_iframe){
        old_iframe.remove();
    }
    let results = '';
    const targetOrigin = window.location.origin;
    const iframe = document.createElement("iframe");
    iframe.id = 'sandbox';
    iframe.style.display = 'none';
    iframe.src = "sandbox.html";
    document.body.append(iframe)
    iframe.onload = () => {
        iframe.contentWindow.postMessage({code: code}, targetOrigin);
    };
    window.onmessage = (event) => {
        if(event.data){
            console.log(event.data)
            let clog = event.data?.args?.[0] ?? false;
            if (clog !== false) {
                clog = stringifyComplexValue(clog)
                results += clog + '<br>';
            } else{
                results += stringifyComplexValue(event.data);
                if(event.data.type === undefined){
                    js_code_exec_output = results;
                    js_code_exec_finished = true;
                }
            }
        }else {
            js_code_exec_output = results;
            js_code_exec_finished = true;
        }
    }
}

loadPlugins(); // load plugins

function reloadPage() {
    // this code can be used be plugins
    document.location.reload()
}


// When in stream mode the scrolling may get blocked, this should free up the scrolling
function unlockScroll() {
    let chat_msg = document.querySelector("#chat-messages");
    if (chat_msg) {
        let last_position = chat_msg.scrollTop;
        chat_msg.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown") {
                if (chat_msg.scrollTop <= last_position) {
                    //  chat_msg.scrollTop += 40;
                    console.log('forcing scroll down')
                } else {
                    //  console.log('all fine: down')
                }
                last_position = chat_msg.scrollTop;
            } else if (event.key === "ArrowUp") {
                if (chat_msg.scrollTop >= last_position) {
                    // chat_msg.scrollTop -= 40;
                    console.log('forcing scroll up')
                } else {
                    //console.log('all fine: up')
                }
                last_position = chat_msg.scrollTop;
            }
        })
    }
}

unlockScroll();


function stringifyComplexValue(value, indent = 0) {
    const indentString = "  ".repeat(indent); // Two spaces for indentation
    if (value === null) {
        return "null";
    } else if (typeof value === 'undefined') {
        return "undefined";
    } else if (typeof value !== 'object') { //Handle non-object and non-array values
        return String(value); // Convert to string for non-objects, non arrays and null values
    } else if (Array.isArray(value)) {
        const elements = value.map(item => stringifyComplexValue(item, indent + 1));
        return `[\n${indentString}  ${elements.join(`,\n${indentString}  `)}\n${indentString}]`;
    } else { // Handle objects
        const properties = Object.entries(value)
            .map(([key, val]) => `${indentString}  "${key}": ${stringifyComplexValue(val, indent + 1)}`)
            .join(`,\n`);
        return `{\n${properties}\n${indentString}}`;
    }
}

function whatTimeIsIt() {
    const today = new Date();
    return today.toLocaleDateString('en-US') + " " + today.toLocaleTimeString();
    // ex: 11/19/2024 10:18:57
}

function extractVideoId(text) {
    let video_id = text.match(/youtube.com\/watch\?v=(.*)/)[1] ?? null;
    if (video_id) {
        return video_id.substring(0, 11);
    }
    return null;
}

function loadVideo() {
    let all_user_msgs = document.querySelectorAll(".user");
    if (all_user_msgs.length) {
        let last_user_msg_ele = all_user_msgs[all_user_msgs.length - 1];
        let last_user_msg = last_user_msg_ele.innerHTML;
        let videoId = extractVideoId(last_user_msg);
        if (!videoId) {
            return
        }
        let videoContainer = document.createElement("div");
        videoContainer.className = "video-container";
        const videoFrame = document.createElement("iframe");
        videoFrame.id = "videoFrame";
        videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
        videoContainer.append(videoFrame);
        last_user_msg_ele.prepend(videoContainer)

    }

}


function mediaFull() {
    const all_images = document.querySelectorAll(".user img");
    all_images.forEach(media => {
        media.onclick = () => {
            let newTab = window.open();
            newTab.document.body.innerHTML = `<img src="${media.src}" alt="Imagem Base64">`;
        };
    });
}

mediaFull();


document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'q') {
        //Closes the current chat and starts a new one
         newChat();
        e.preventDefault();
    } else if (!e.ctrlKey && !e.altKey && e.key) {
        let active_tagName = document.activeElement.tagName
        if (active_tagName !== 'INPUT' && active_tagName !== 'TEXTAREA') {
            if (/^[a-zA-Z0-9]$/.test(e.key)) {
                document.getElementById('ta_chat').focus();
            }
        }
    }

});


let new_url = document.URL;
new_url = new_url.split('?')[0];
new_url = new_url.split("#")[0];
new_url += "#" + chat_id;
history.pushState({url: new_url}, '', new_url);
