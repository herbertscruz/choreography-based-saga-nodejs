import axios from 'axios';
import { URL } from 'url';
import { AbstractDomain } from '../../domain/AbstractDomain';
import { IHttpClient } from '../application/IHttpClient';

export class AxiosHttpClient<Type extends AbstractDomain> implements IHttpClient<Type> {

    private instance;

    constructor(config = {}) {
        config = Object.assign({}, config, {
            timeout: 10000
        });
        this.instance = axios.create(config);
    }

    get(url: URL) {
        return this.instance.get(url.toString());
    }

    post(url: URL, entity: Type) {
        return this.instance.post(url.toString(), entity.getData());
    }

    put(url: URL, entity: Type) {
        return this.instance.post(url.toString(), entity.getData());
    }

    delete(url: URL) {
        return this.instance.get(url.toString());
    }

}