class GoogleSearch {
    constructor() {
        this.search_results = {};
    }

    async search(term, max_results = 10, start = 0) {
        let cse_active = await gcseActive();
        if(!cse_active){
            addWarning('Not Active')
        }

        let GOOGLE_SEARCH_API_KEY = localStorage.getItem('cse_google_api_key')
        let GOOGLE_SEARCH_CX = localStorage.getItem('cse_google_cx_id')

        if (max_results > 10) {
            throw new Error('max result per page is 10.');
        }
        if (start > 91) {
            throw new Error('Is not possible to list more then 100 results, start= 91 is the max possible');
        }

        const encodedTerm = encodeURIComponent(term);
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_CX}&q=${encodedTerm}&num=${max_results}&start=${start}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                console.error('Google CSE -> Error details:', data.error);
            }
           return this.search_results = data || {};
        } catch (error) {
            throw new Error(`Fetch Error: ${error.message}`);
        }
    }
}