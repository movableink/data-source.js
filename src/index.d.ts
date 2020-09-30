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
    getRawData(params: object, options?: {}): Promise<any>;
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
