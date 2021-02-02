import { CDResponse } from '../types/cropduster';
export interface TargetingParams {
    [key: string]: string | number | Object[] | Object;
}
export default class DataSource {
    key: string;
    sorcererUrlBase: string;
    miParams: Object;
    constructor(key: string);
    /**
     *
     * @param params
     * @param options
     */
    getRawData(params: TargetingParams, options?: {}): Promise<CDResponse>;
    /**
     *
     * @param opts
     */
    getMultipleTargets(opts?: any): Promise<any>;
    /**
     *
     * @param set
     * @param opts
     */
    getSingleTarget(opts?: any): Promise<any>;
    /**
     *
     * @param params
     * @param opts
     */
    getLocationTargets(params?: any, opts?: any): Promise<any>;
}
