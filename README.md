# Nest.js Jest Decorators


This library lets you use **test decorators** to create your test suite, with all these benefits
- You can create tests suites and tests using classes, instead of jest anonymous functions
- You can inject your components in your tests, instead of using app.get(Component to use)
- You can use inheritance
- You can pick which test or suite you want to run

Example

    ```
    @TestSuite('Demo Test Suite')
    export class DemoTest {

        @Inject() 
        private readonly httpService: HttpService

        @Test('Get Test')
        async testGet(): Promise<void> {
            const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'))
            expect(data).toBe('Hello, Test world !')
        }
    }
    ```

## Installation

Install with npm globally: ( as a development dependency because it will be use for tests only )

```
npm i --save-dev nestjs-jests-decorators
```

## Configuration

Its better with an example.

- Add your tests entry point in **test** directory

```
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
  test("", async () => {});

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
```

- Add this line to your package.json

```
    "test": "jest"
```

- Add file jest.config.js with this content:

```
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/test.entrypoint.ts'],
  injectGlobals: true,
  verbose: true
};
```

- Start coding your tests

```
import { HttpService } from "@nestjs/axios";
import { Inject } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Test, TestSuite } from "../../src";
import expect from 'expect'


@TestSuite('Demo Test Suite')
export class DemoTest {

    @Inject()
    private readonly httpService: HttpService

    @Test('Get Test')
    async testGet(): Promise<void> {
        const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'))
        expect(data).toBe('Hello, Test world !')
    }
}
```

- Run all your tests with:

```
npm run test
```

- If you want to run the tests of a single class ( **suite** ), you can:

```
SUITETORUN="Demo Test Suite" npm run test
```

- Or, perhaps you want to run a single test, with:

```
TESTTORUN="Get Test" npm run test
```

## Comments, suggestions and more

Creating a ticket on github can be very annoying ... send me your comments, problems and suggestions to mcarrizo@gmail.com

Best !
