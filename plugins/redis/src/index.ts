import { resolve } from "path";
import {
  DsgContext,
  AmplicationPlugin,
  Events,
  Module,
  EventNames,
  CreateServerParams,
  CreateAdminUIParams,
  CreateServerDockerComposeParams,
  CreateServerAppModuleParams,
} from "@amplication/code-gen-types";


class ExamplePlugin implements AmplicationPlugin {
  /**
   * This is mandatory function that returns an object with the event name. Each event can have before or/and after
   */
  register(): Events {
    return {
    [EventNames.CreateServerDockerCompose]: {
      before: this.beforeCreateDockerCompose
    },
    [EventNames.CreateServer]: {
      after: this.afterCreateServer
    },
    [EventNames.CreateServerAppModule]: {
      after: this.afterCreateServerAppModule
    },
    };
  }


  beforeCreateDockerCompose(
    dsgContext: DsgContext,
    eventParams: CreateServerDockerComposeParams
  ): CreateServerDockerComposeParams {
    const CACHE = "cache";
    const RESTART = "restart";
    const COMMAND = "redis-server --save 20 1 --loglevel warning --requirepass eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81";
    const KAFKA_PORT = "9092";
    const newParams = {
      services: {
        [CACHE]: {
          image: "redis:7-alpine",
          restart: [RESTART],
          ports: {
            6379: 6379,
          },
          command: COMMAND,
          volumes: {
            "cache":"/data",
          },
        },
      }
    };
    eventParams.updateProperties.push(newParams);
    return eventParams;
  }

  async afterCreateServer (
    context: DsgContext,
    eventParams: CreateServerParams,
    modules: Module[]
  ) {
    // Here you can get the context, eventParams and the modules that Amplication created.
    // Then you can manipulate the modules, add new ones, or create your own.
    const staticPath = resolve(__dirname, "../static");
    const staticsFiles = await context.utils.importStaticModules(
      staticPath,
      context.serverDirectories.srcDirectory
    );

    staticsFiles.forEach(file =>  {
      file.path = "server/providers/cache/redis"; 
    }); 

    return [ ...modules, ...staticsFiles]; // You must return the generated modules you want to generate at this part of the build.
  }

  afterCreateServerAppModule(
    dsgContext: DsgContext,
    eventParams: CreateServerAppModuleParams
  ) :Promise <Module[]>{

    const file = KafkaPlugin.moduleFile;
    if (!file) {
      throw new Error("Kafka module file not found");
    }
    eventParams.modulesFiles.push(file);
    return eventParams;
  }
}

export default ExamplePlugin;
