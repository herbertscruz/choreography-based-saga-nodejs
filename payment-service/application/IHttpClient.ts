import { AbstractDomain } from '../../domain/AbstractDomain'

export interface IHttpClient<Type extends AbstractDomain> {
    get(url: URL);
    post(url: URL, entity: Type);
    put(url: URL, entity: Type);
    delete(url: URL);
} 