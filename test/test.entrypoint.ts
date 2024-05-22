import { HttpModule } from "@nestjs/axios";
import { ConsoleLogger, INestApplication } from "@nestjs/common";
import { Test, TestingModule, TestingModuleBuilder } from "@nestjs/testing";
import { DecoratedSuites, JestTestModule } from "../src";
import { DemoTest } from "./tests/demo.test";
import { YourAppModule } from "./your-app/your-app.module";

const TESTTORUN = process.env.TESTTORUN;
const SUITETORUN = process.env.SUITETORUN;

const initNest = async (): Promise<INestApplication> => {
  const testingModuleBuilder: TestingModuleBuilder =
    await Test.createTestingModule({
      imports: [
        YourAppModule, // The app to test
        JestTestModule.registerTests([DemoTest], [HttpModule]), // Your test suite
      ],
    });
  const testingModule: TestingModule = await testingModuleBuilder.compile();
  const app = testingModule.createNestApplication();
  app.useLogger(new ConsoleLogger());
  app.listen(4343);
  return app;
};

let app: INestApplication;
beforeAll(async () => {
  app = await initNest();
});

describe("Complete Suite to run", () => {
  test("", () => {});

  const isSelectedToRun = (actualName, selectedName) => {
    return !selectedName || selectedName === actualName;
  };

  for (const appTestClass of Object.keys(DecoratedSuites)) {
    const testSuite = DecoratedSuites[appTestClass];
    describe(testSuite.title, () => {
      if (isSelectedToRun(testSuite.title, SUITETORUN)) {
        for (const testMethod of testSuite.tests) {
          if (isSelectedToRun(testMethod.description, TESTTORUN)) {
            it(testMethod.description, async () => {
              const c = app.get(testSuite.target);
              await testMethod.method.apply(c);
            });
          }
        }
      }
    });
  }
});

afterAll(async () => {
  app.close();
});
