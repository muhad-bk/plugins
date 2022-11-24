import { resolve } from "path";
import {
  DsgContext,
  AmplicationPlugin,
  Events,
  Module,
  EventNames,
  CreateAdminUIParams,
  CreateServerDotEnvParams,
} from "@amplication/code-gen-types";
import { ServiceNameKey } from "./constants";

class DeployHelmPlugin implements AmplicationPlugin {
  /**
   * This is mandatory function that returns an object with the event name. Each event can have before or/and after
   */
  register(): Events {
    return {
      [EventNames.CreateServerDotEnv]: {
        after: this.afterDotEnv,
      },
      [EventNames.CreateAdminUI]: {
        after: this.afterCreateAdminUI,
      },
    };
  }

  async afterDotEnv(
    context: DsgContext,
    eventParams: CreateServerDotEnvParams,
    modules: Module[]
  ) {
    const staticPath = resolve(__dirname, "./static/server");
    const staticsFiles = await context.utils.importStaticModules(
      staticPath,
      context.serverDirectories.baseDirectory
    );

    // Get plugin settings for container repository and tag, autoscaling and co.

    if (!context.resourceInfo) {
      console.error("Missing service name");
      throw new Error("Missing service name");
    }

    const serviceName = context.resourceInfo.name
      .toLocaleLowerCase()
      .replaceAll(" ", "-");

    const helmChartFiles = staticsFiles
      .filter((file) => file.path.indexOf("._") < 0)
      .map(
        (file): Module => ({
          path: file.path,
          code: file.code.replaceAll(ServiceNameKey, serviceName),
        })
      );

    return [...modules, ...helmChartFiles];
  }

  async afterCreateAdminUI(
    context: DsgContext,
    _eventParams: CreateAdminUIParams,
    modules: Module[]
  ): Promise<Module[]> {
    const staticPath = resolve(__dirname, "./static/admin");
    const staticsFiles = await context.utils.importStaticModules(
      staticPath,
      context.clientDirectories.baseDirectory
    );

    // Get plugin settings for container repository and tag, autoscaling and co.
    if (!context.resourceInfo) {
      console.error("Missing service name");
      throw new Error("Missing service name");
    }

    const serviceName = context.resourceInfo.name
      .toLocaleLowerCase()
      .replaceAll(" ", "-");

    const helmChartFiles = staticsFiles
      .filter((file) => file.path.indexOf("._") < 0)
      .map(
        (file): Module => ({
          path: file.path,
          code: file.code.replaceAll(ServiceNameKey, serviceName),
        })
      );

    return [...modules, ...helmChartFiles];
  }
}

export default DeployHelmPlugin;
