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

It's like assembling the ultimate superhero team of AI

![Orion Screenshot](imgs/screenshot.png "Orion Screenshot")


With Orion, users can easily navigate and assess the strengths and limitations of different AI models through an intuitive,
user-friendly interface.

## Key Features

- 🖥️ Browser - No need to download anything ⚡️
- 🗣️ TTS - Realistic text-to-speech using ElevenLabs
- 🎙️ STT - Speech-to-Text using Groq/Whisper ️
- 🔄 Seamless integration with multiple AI models
- ✨ Clean and responsive web interface 🌐
- 🌈 Syntax highlighting for code snippets 🖌️
- ⬇️ One-click download for AI-generated code outputs
- 🎛️ Customizable system prompts to tailor responses 🛠️
- 🌐 Special command for quick and easy language translation tasks
- 📁 Upload a variety of documents (text, PDF, images, video) to Google Gemini for analysis and processing



## API Key Management

Your API keys are stored locally using `localStorage`, and requests are sent directly to the official provider's API
(OpenAI, Anthropic, Google, Groq, Cerebras) without routing through any external proxy.

### Free API Keys

- **Google Gemini:** [Get your key](https://aistudio.google.com/app/apikey)
- **Cerebras:** [Sign up for an API key](https://cloud.cerebras.ai/platform/)
- **Groq:** [Request a key](https://console.groq.com/keys)

### Paid API Keys

- **OpenAI:** [Get your key](https://platform.openai.com/api-keys)
- **Anthropic:** [Sign up for an API key](https://console.anthropic.com/settings/keys)

### Free and Paid API Keys
- **Cohere** [Get your key](https://dashboard.cohere.com/api-keys)

## Special Commands
Translate text with ease using special command.
### Translation
- Usage example, type: `t:spanish Hello everyone!` to translate to Spanish
- As you can see, you don't need to specify the source language, just the target language.

## Awesome Prompts
150+ awesome prompts from [🧠 Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts) to select with one click.
