<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-server](./kibana-plugin-server.md) &gt; [OnPreResponseHandler](./kibana-plugin-server.onpreresponsehandler.md)

## OnPreResponseHandler type

See [OnPreAuthToolkit](./kibana-plugin-server.onpreauthtoolkit.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare type OnPreResponseHandler = (request: KibanaRequest, preResponse: OnPreResponseInfo, toolkit: OnPreResponseToolkit) => OnPreResponseResult | Promise<OnPreResponseResult>;
```