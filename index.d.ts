import 'egg';
import { EventEmitter } from 'events';

enum ApolloNameSpaceEnum {
  PROPERTIES = 'PROPERTIES',
  JSON = 'JSON'
}
class ApolloApplication {
  cluster(cluster?: string): ApolloCluster;
  namespace(
    namespace?: string = 'application',
    type: ApolloNameSpaceEnum = 'PROPERTIES'
  ): ApolloNameSpace;
}
class ApolloCluster {
  enableUpdateNotification(enable: boolean): this;
  namespace(namespace?: string = 'application', type?: '' | ''): ApolloNameSpace;
  get cluster(): string;
}
class ApolloNameSpace extends EventEmitter {
  async ready(): this;
  config(): Object;
  get(key: string): string;
  has(key: string): boolean;
  enableFetch(enable: boolean): this;
  get namespace(): string;
  get cluster(): string;
}

declare module 'egg' {
  // 扩展 service
  interface IService {
    news: News;
  }

  // 扩展 app
  interface Application {
    apollo: ApolloApplication;
  }

  // 扩展 context
  interface Context {}

  // 扩展你的配置
  interface EggAppConfig {
    /**
     * Apollo命名空间application配置
     */
    application?: any;
    apollo: {
      /**
       * host
       */
      host: string;
      /**
       * appId
       */
      appId: string;
      /**
       * 集群，默认default
       */
      cluster?: string;
      /**
       * 命名空间数组，默认[ 'application' ]
       */
      namespaces?: string[];
      /**
       * 缓存目录 默认/tmp/apollo_cache
       */
      cachePath?: string;
      /**
       * 启用推送功能 默认开启
       */
      enableUpdateNotification?: boolean;
      /**
       * 启用定时拉取 默认开启
       */
      enableFetch?: boolean;
      /**
       * 定时拉取间隔 默认5分钟
       */
      fetchInterval?: number;
      /**
       * 初始化连接的时候重试次数 默认10次
       */
      retry?: number;
      /**
       * 将某个namespace合入config 默认不合入
       */
      mergeNamespace?: string;
      /**
       * 是否将namespaces各个配置挂载到config 默认挂载
       */
      mountConfig?: boolean;
    };
  }
}
