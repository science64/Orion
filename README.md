# Orion
Orion is a web-based chat interface that simplifies interactions with multiple AI model providers.
It provides a unified platform for chatting and exploring multiple large language models (LLMs), including:

- 🛠️ Ollama – An open-source tool for running LLMs locally 🏡 
- 🤖 OpenAI (GPT model)
- 🎯 Cohere (Command-r models)
- 🌌 Google (Gemini models)
- 🟡 Anthropic (Claude models)
- 🚀 Groq Inc. – Optimized for fast inference (open source models) ⚡️
- ⚡️ Cerebras – Also optimized for fast inference 🚀
- 🟣 SambaNova - Fast inference and support for Meta-Llama-3.1-405B-Instruct 🦙🦙🦙.🦙

![Orion Screenshot](imgs/screenshot.png "Orion Screenshot")


With Orion, you can easily navigate and assess the strengths and limitations of different AI models through an intuitive,
user-friendly interface.

## Key Features

- 🖥️ Browser - No need to download anything ⚡️
- ✅ Code Execution (Execute code with Google Gemini)
- 🗣️ TTS - Realistic text-to-speech using ElevenLabs
- 🎙️ STT - Speech-to-Text using Groq/Whisper ️
- 🔄 Seamless integration with multiple AI models
- ✨ Clean and responsive web interface 🌐
- 🌈 Syntax highlighting for code snippets 🖌️
- ⬇️ One-click download for AI-generated code outputs
- 🎛️ Customizable system prompts to tailor responses 🛠️
- 🌐 Special command for quick and easy language translation tasks
- 📁 Upload a variety of documents (text, PDF, images, video) to Google Gemini for analysis and processing
- 🧠 Awesome Prompts 150+ awesome prompts most of them from [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts) to select with one click.



## API Key Management

Your API keys are stored locally using `localStorage`, and requests are sent directly to the official provider's API
(OpenAI, Anthropic, Google, Groq, Cerebras) without routing through any external proxy.


### Free API Keys
Some companies offer free API access. Check their terms and conditions before you get started.
- **Google Gemini:** [Get your key](https://aistudio.google.com/app/apikey)
- **Cerebras:** [Sign up for an API key](https://cloud.cerebras.ai/platform/)
- **Cohere:** [Get your key](https://dashboard.cohere.com/api-keys)
- **Groq:** [Request a key](https://console.groq.com/keys)
- **SambaNova:** [SambaNova Key](https://cloud.sambanova.ai/apis)
- **Together AI:** Only for meta-llama/Llama-3.3-70B-Instruct-Turbo-Free  [TogheterAI Key](https://api.together.ai/settings/api-keys)

### Paid API Keys

- **OpenAI:** [Get your key](https://platform.openai.com/api-keys)
- **Anthropic:** [Sign up for an API key](https://console.anthropic.com/settings/keys)

# Special Commands
Use special commands to perform an action quickly and easily.
### Translation
**Translate:** Translate text with ease using special command.
- To translate "Hello everyone!" into Spanish, use: `translate:spanish Hello everyone!` or its short form `t:spanish Hello everyone!`.
- AI will automatically detect the source language, requiring only the target language specification.

**YouTube Summary**
Ask AI to summarize a YouTube video or answer any question based on the video caption.
See an example of use below.
- `Summarize this video https://www.youtube.com/watch?v=r7pEdhnS3tI`
- `What is this video about? https://www.youtube.com/watch?v=qQviI1d_hFA`
It is recommended to use a larger context window model when using this functionality, such as Google Gemini.

### Keyboard shortcut. 
Press `Ctrl + Q` to close the current chat and start a new one.

### Retrieval-Augmented Generation (RAG)
Search: Perform quick searches and retrieve relevant information with ease from Google.
- Example: `search: What is the latest news?` or `s: What is the latest news?`
### Execution of JavaScript code in the user's browser.
Please perform this functionality with caution and always check code before accepting execution.
- Example: `javascript: How Many R's in 'Strawberry'?` or `js: How Many R's in 'Strawberry'?`
- This will allow the AI to generate Javascript code that will run in your browser.
### Executing Python code in a remote environment
- When using Google Gemini you can ask it to execute codes directly in Google's own remote environment. For now only 
Python codes are executed. The code and output will be returned.
- Command example: `py: Run a python code to write "tseb eht sI noirO" in the inverse order`
- Another example: `py: The United States has a population of 342,524,968, of which 480,000 die annually due to tobacco use. 
What percentage is that?`

# How to Run
To run Orion first download this repository.

You can download it by running the following command in your terminal:

```bash
git clone https://github.com/EliasPereirah/OrionChat.git
```
Or download the zip file from the repository by clicking on the green button "Code" and then [Download ZIP](https://github.com/EliasPereirah/OrionChat/archive/refs/heads/master.zip).

After downloading, just open the folder and click on index.html if you don't have a server. 
If you do, just access the directory where the project was saved. It's that simple.

# Google CSE API Key
To search using Google, you will need Google CSE (Custom Search Engine) API Key and CX.
- First, create a custom search here [Google CSE Panel](https://programmablesearchengine.google.com/controlpanel/all)
- Copy your CX ID
- Go to [Google Developers](https://developers.google.com/custom-search/v1/introduction) and click on *Get a Key* to get your API Key
- Now just enter CX and API key in Orion. for that go to Options -> More Options and that's it, it's time to chat.
- *Note: Google Search will return only snippets of search results, which can often provide enough context for AI, 
  but not in-depth information. 
In some cases, AI may fail to provide an answer or provide an incorrect answer due to a lack of broader context. 
Keep this in mind when using this tool.

# Rag Endpoint
### BETA
For better search results, you can configure a search endpoint. 

A POST request with `query` will be sent to this endpoint, where query is the search term.

These configurations were created to be compatible with
https://github.com/EliasPereirah/SearchAugmentedLLM/ (Not perfect, but better than just Google snippet)

If you want to use any other endpoint, make sure it returns a JSON with the text field, where text will be 
the content passed to the LLM.

By adding such an endpoint you will be able to use it by writing at the beginning of the chat `s: Why is the sky blue?` 
and the answer will be based on the context returning from the "rag endpoint"

An advanced option for those using Google Gemini may be to use "Grounding with Google Search", this feature is not
implemented here and has a cost of $35 / 1K grounding requests.

# Proxy
To get around CORS errors when working with SambaNova a proxy may be necessary.

If you are using Orion via localhost or a hosting with PHP support, you can use the PHP proxy code available in this 
repository (`proxy.php` file) for this you will also need to add the following JavaScript code in plugins.

To do this, click on "Options" -> Plugins and paste the JavaScript code provided below:


```javascript
let proxy_url =  window.location.origin + window.location.pathname + "/proxy.php";
// ^^ This assumes the proxy URL is on the same host, otherwise enter it above. ^^
if(chosen_platform === "sambanova" || chosen_platform === "nvidia"){
  endpoint = proxy_url+"?platform="+chosen_platform;
}
function setProxyEndpoint(event){
  if(chosen_platform === "sambanova" || chosen_platform === "nvidia"){
    let proxy_endpoint = proxy_url+"/proxy.php?platform="+chosen_platform;
    if(proxy_endpoint !== endpoint){
      endpoint = proxy_endpoint;
      removeLastMessage();
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
```

Be careful when using any other proxy as sensitive data will be passed through it like your API key and messages. 
Use only trusted services.

# YouTube Caption
To enable AI responses based on YouTube video subtitles, set up an API endpoint to get them.

When submitting a YouTube URL in the chat, a popup will open allowing you to set up this endpoint.

This repository already provides this functionality in the plugins folder, to use it you will need to have
PHP enabled on your server. 

Note: You do not need a server to run this project as long as you do not want to use certain 
features, such as the one mentioned above.

If you wish, you can implement the following code on another server of your choice and point to the correct endpoint.

Code: https://github.com/EliasPereirah/YoutubeSubtitlesDownloader