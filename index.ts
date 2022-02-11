import { AxiosHttpClient } from "./payment-service/infrastructure/AxiosHttpClient";
import { URL } from 'url';
import { Event } from "./domain/Event";

const client = new AxiosHttpClient();
const urlGet = new URL('https://jsonplaceholder.typicode.com/todos/1');
const urlPost = new URL('https://jsonplaceholder.typicode.com/posts');

(async() => {
    let result = await client.get(urlGet);
    console.log(result);

    result = await client.post(urlPost, new Event());
    console.log(result);
})();