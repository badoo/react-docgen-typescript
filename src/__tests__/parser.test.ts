import { assert } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import {
  getDefaultExportForFile,
  parse,
  PropFilter,
  withCustomConfig,
  withDefaultConfig
} from '../parser';
import { check, checkComponent, fixturePath } from './testUtils';

describe('parser', () => {
  const children = { type: 'ReactNode', required: false, description: '' };

  test('should parse simple react class component', () => {
    check('Column', {
      Column: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' },
        prop3: { type: '() => void' },
        prop4: { type: '"option1" | "option2" | "option3"' }
      }
    });
  });

  test('should parse simple react class component with console.log inside', () => {
    check('ColumnWithLog', {
      Column: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' },
        prop3: { type: '() => void' },
        prop4: { type: '"option1" | "option2" | "option3"' }
      }
    });
  });

  test('should parse simple react class component as default export', () => {
    check('ColumnWithDefaultExport', {
      Column: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' },
        prop3: { type: '() => void' },
        prop4: { type: '"option1" | "option2" | "option3"' }
      }
    });
  });

  test('should parse mulitple files', () => {
    const result = parse([
      fixturePath('Column'),
      fixturePath('ColumnWithDefaultExportOnly')
    ]);

    checkComponent(
      result,
      {
        Column: {},
        ColumnWithDefaultExportOnly: {}
      },
      false
    );
  });

  test('should parse simple react class component as default export only', () => {
    check('ColumnWithDefaultExportOnly', {
      ColumnWithDefaultExportOnly: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' },
        prop3: { type: '() => void' },
        prop4: { type: '"option1" | "option2" | "option3"' }
      }
    });
  });

  test('should parse simple react class component as default anonymous export', () => {
    check('ColumnWithDefaultAnonymousExportOnly', {
      ColumnWithDefaultAnonymousExportOnly: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' },
        prop3: { type: '() => void' },
        prop4: { type: '"option1" | "option2" | "option3"' }
      }
    });
  });

  test('should parse simple react class component with state', () => {
    check('AppMenu', {
      AppMenu: {
        menu: { type: 'any' }
      }
    });
  });

  test('should parse simple react class component with picked properties', () => {
    // we are not able to get correct descriptions for prop1,prop2
    check('ColumnWithPick', {
      Column: {
        prop1: {
          type: 'string',
          required: false,
          description: 'prop1 description'
        },
        prop2: { type: 'number', description: 'prop2 description' },
        propx: { type: 'number' }
      }
    });
  });

  test('should parse component with props with external type', () => {
    check('ColumnWithPropsWithExternalType', {
      ColumnWithPropsWithExternalType: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' },
        prop3: { type: 'MyExternalType' }
      }
    });
  });

  test('should parse HOCs', () => {
    check('ColumnHigherOrderComponent', {
      ColumnExternalHigherOrderComponent: {
        prop1: { type: 'string' }
      },
      ColumnHigherOrderComponent1: {
        prop1: { type: 'string' }
      },
      ColumnHigherOrderComponent2: {
        prop1: { type: 'string' }
      },
      RowExternalHigherOrderComponent: {
        prop1: { type: 'string' }
      },
      RowHigherOrderComponent1: {
        prop1: { type: 'string' }
      },
      RowHigherOrderComponent2: {
        prop1: { type: 'string' }
      }
    });
  });

  test('should parse component with inherited properties HtmlAttributes<any>', () => {
    check(
      'ColumnWithHtmlAttributes',
      {
        Column: {
          // tslint:disable:object-literal-sort-keys
          prop1: { type: 'string', required: false },
          prop2: { type: 'number' },
          // HtmlAttributes
          defaultChecked: {
            type: 'boolean',
            required: false,
            description: ''
          }
          // ...
          // tslint:enable:object-literal-sort-keys
        }
      },
      false
    );
  });

  test('should parse component without exported props interface', () => {
    check('ColumnWithoutExportedProps', {
      Column: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' }
      }
    });
  });

  test('should parse nested types', () => {
    check('ComponentWithNestedTypes', null, true, null, {
      shouldExtractNestedDocs: true
    });
  });

  test('should parse functional component exported as const', () => {
    check(
      'ConstExport',
      {
        Row: {
          prop1: { type: 'string', required: false },
          prop2: { type: 'number' }
        },
        // TODO: this wasn't there before, i would guess that that's correct
        test: {}
      },
      false
    );
  });

  test('should parse react component with properties defined in external file', () => {
    check('ExternalPropsComponent', {
      ExternalPropsComponent: {
        prop1: { type: 'string' }
      }
    });
  });

  test('should parse react component with properties extended from an external .tsx file', () => {
    check('ExtendsExternalPropsComponent', {
      ExtendsExternalPropsComponent: {
        prop1: { type: 'number', required: false, description: 'prop1' },
        prop2: { type: 'string', required: false, description: 'prop2' }
      }
    });
  });

  test('should parse react component with properties defined as type', () => {
    check(
      'FlippableImage',
      {
        FlippableImage: {
          isFlippedX: { type: 'boolean', required: false },
          isFlippedY: { type: 'boolean', required: false }
        }
      },
      false
    );
  });

  test('should parse react component with const definitions', () => {
    check('InlineConst', {
      MyComponent: {
        foo: { type: 'any' }
      }
    });
  });

  test('should parse react component that exports a prop type const', () => {
    check('ExportsPropTypeShape', {
      ExportsPropTypes: {
        foo: { type: 'any' }
      }
    });
  });

  test('should parse react component that exports a prop type thats imported', () => {
    check('ExportsPropTypeImport', {
      ExportsPropTypes: {
        foo: { type: 'any' }
      }
    });
  });

  // see issue #132 (https://github.com/styleguidist/react-docgen-typescript/issues/132)
  test('should determine the parent fileName relative to the project directory', () => {
    check(
      'ExportsPropTypeImport',
      {
        ExportsPropTypes: {
          foo: {
            parent: {
              fileName:
                'react-docgen-typescript/src/__tests__/data/ExportsPropTypeImport.tsx',
              name: 'ExportsPropTypesProps'
            },
            type: 'any'
          } as any
        }
      },
      true
    );
  });

  describe('component with default props', () => {
    const expectation = {
      ComponentWithDefaultProps: {
        sampleDefaultFromJSDoc: {
          defaultValue: 'hello',
          description: 'sample with default value',
          required: true,
          type: '"hello" | "goodbye"'
        },
        sampleFalse: {
          defaultValue: 'false',
          required: false,
          type: 'boolean'
        },
        sampleNull: { type: 'null', required: false, defaultValue: 'null' },
        sampleNumber: { type: 'number', required: false, defaultValue: '-1' },
        sampleObject: {
          defaultValue: `{ a: '1', b: 2, c: true, d: false, e: undefined, f: null, g: { a: '1' } }`,
          required: false,
          type: '{ [key: string]: any; }'
        },
        sampleString: {
          defaultValue: 'hello',
          required: false,
          type: 'string'
        },
        sampleTrue: { type: 'boolean', required: false, defaultValue: 'true' },
        sampleUndefined: {
          defaultValue: 'undefined',
          required: false,
          type: 'any'
        }
      }
    };

    test('should parse defined props', () => {
      check('ComponentWithDefaultProps', expectation);
    });

    test('should parse referenced props', () => {
      check('ComponentWithReferencedDefaultProps', expectation);
    });
  });

  test('should parse react PureComponent', () => {
    check('PureRow', {
      Row: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' }
      }
    });
  });

  test('should parse react PureComponent - regression test', () => {
    check(
      'Regression_v0_0_12',
      {
        Zoomable: {
          originX: { type: 'number' },
          originY: { type: 'number' },
          scaleFactor: { type: 'number' }
        }
      },
      false
    );
  });

  test('should parse react functional component', () => {
    check('Row', {
      Row: {
        prop1: { type: 'string', required: false },
        prop2: { type: 'number' }
      }
    });
  });

  test('should parse react stateless component', () => {
    check('Stateless', {
      Stateless: {
        myProp: { type: 'string' }
      }
    });
  });

  test('should parse react stateless component with intersection props', () => {
    check('StatelessIntersectionProps', {
      StatelessIntersectionProps: {
        moreProp: { type: 'number' },
        myProp: { type: 'string' }
      }
    });
  });

  test('should parse react stateless component with external intersection props', () => {
    check('StatelessIntersectionExternalProps', {
      StatelessIntersectionExternalProps: {
        myProp: { type: 'string' },
        prop1: { type: 'string', required: false }
      }
    });
  });

  test('should parse react stateful component with intersection props', () => {
    check('StatefulIntersectionProps', {
      StatefulIntersectionProps: {
        moreProp: { type: 'number' },
        myProp: { type: 'string' }
      }
    });
  });

  test('should parse react stateful component with external intersection props', () => {
    check('StatefulIntersectionExternalProps', {
      StatefulIntersectionExternalProps: {
        myProp: { type: 'string' },
        prop1: { type: 'string', required: false }
      }
    });
  });

  test('should parse react stateful component (wrapped in HOC) with intersection props', () => {
    check('HOCIntersectionProps', {
      HOCIntersectionProps: {
        injected: { type: 'boolean' },
        myProp: { type: 'string' }
      }
    });
  });

  describe('stateless component with default props', () => {
    const expectation = {
      StatelessWithDefaultProps: {
        sampleDefaultFromJSDoc: {
          defaultValue: 'hello',
          description: 'sample with default value',
          required: true,
          type: '"hello" | "goodbye"'
        },
        sampleEnum: {
          defaultValue: 'enumSample.HELLO',
          required: false,
          type: 'enumSample'
        },
        sampleFalse: {
          defaultValue: 'false',
          required: false,
          type: 'boolean'
        },
        sampleNull: { type: 'null', required: false, defaultValue: 'null' },
        sampleNumber: { type: 'number', required: false, defaultValue: '-1' },
        sampleObject: {
          defaultValue: `{ a: '1', b: 2, c: true, d: false, e: undefined, f: null, g: { a: '1' } }`,
          required: false,
          type: '{ [key: string]: any; }'
        },
        sampleString: {
          defaultValue: 'hello',
          required: false,
          type: 'string'
        },
        sampleTrue: { type: 'boolean', required: false, defaultValue: 'true' },
        sampleUndefined: {
          defaultValue: 'undefined',
          required: false,
          type: 'any'
        }
      }
    };

    test('should parse defined props', () => {
      check('StatelessWithDefaultProps', expectation);
    });

    test('should parse props with shorthands', () => {
      check('StatelessShorthandDefaultProps', {
        StatelessShorthandDefaultProps: {
          onCallback: {
            defaultValue: null,
            description: 'onCallback description',
            required: false,
            type: '() => void'
          },
          regularProp: {
            defaultValue: 'foo',
            description: 'regularProp description',
            required: false,
            type: 'string'
          },
          shorthandProp: {
            defaultValue: '123',
            description: 'shorthandProp description',
            required: false,
            type: 'number'
          }
        }
      });
    });

    test('supports destructuring', () => {
      check('StatelessWithDestructuredProps', expectation);
    });

    test('supports destructuring for arrow functions', () => {
      check('StatelessWithDestructuredPropsArrow', expectation);
    });

    test('supports typescript 3.0 style defaulted props', () => {
      check('StatelessWithDefaultPropsTypescript3', expectation);
    });
  });

  test('should parse functional component component defined as function', () => {
    check('FunctionDeclaration', {
      Jumbotron: {
        prop1: { type: 'string', required: true }
      }
    });
  });

  test('should parse functional component component defined as const', () => {
    check('FunctionalComponentAsConst', {
      Jumbotron: {
        prop1: { type: 'string', required: true }
      }
    });
  });

  test('should parse React.SFC component defined as const', () => {
    check('ReactSFCAsConst', {
      Jumbotron: {
        prop1: { type: 'string', required: true }
      }
    });
  });

  test('should parse functional component component defined as function as default export', () => {
    check('FunctionDeclarationAsDefaultExport', {
      Jumbotron: {
        prop1: { type: 'string', required: true }
      }
    });
  });

  test('should parse functional component component defined as const as default export', () => {
    check(
      'FunctionalComponentAsConstAsDefaultExport',
      {
        // in this case the component name is taken from the file name
        FunctionalComponentAsConstAsDefaultExport: {
          prop1: { type: 'string', required: true }
        }
      },
      true,
      'Jumbotron description'
    );
  });

  test('should parse React.SFC component defined as const as default export', () => {
    check(
      'ReactSFCAsConstAsDefaultExport',
      {
        // in this case the component name is taken from the file name
        ReactSFCAsConstAsDefaultExport: {
          prop1: { type: 'string', required: true }
        }
      },
      true,
      'Jumbotron description'
    );
  });

  test('should parse functional component component defined as const as named export', () => {
    check(
      'FunctionalComponentAsConstAsNamedExport',
      {
        // in this case the component name is taken from the file name
        FunctionalComponentAsConstAsNamedExport: {
          prop1: { type: 'string', required: true }
        }
      },
      true,
      'Jumbotron description'
    );
  });

  test('should parse React.SFC component defined as const as named export', () => {
    check(
      'ReactSFCAsConstAsNamedExport',
      {
        // in this case the component name is taken from the file name
        ReactSFCAsConstAsNamedExport: {
          prop1: { type: 'string', required: true }
        }
      },
      true,
      'Jumbotron description'
    );
  });

  describe('displayName', () => {
    test('should be taken from stateless component `displayName` property (using named export)', () => {
      const [parsed] = parse(fixturePath('StatelessDisplayName'));
      assert.equal(parsed.displayName, 'StatelessDisplayName');
    });

    test('should be taken from stateful component `displayName` property (using named export)', () => {
      const [parsed] = parse(fixturePath('StatefulDisplayName'));
      assert.equal(parsed.displayName, 'StatefulDisplayName');
    });

    test('should be taken from stateless component `displayName` property (using default export)', () => {
      const [parsed] = parse(fixturePath('StatelessDisplayNameDefaultExport'));
      assert.equal(parsed.displayName, 'StatelessDisplayNameDefaultExport');
    });

    test('should be taken from stateful component `displayName` property (using default export)', () => {
      const [parsed] = parse(fixturePath('StatefulDisplayNameDefaultExport'));
      assert.equal(parsed.displayName, 'StatefulDisplayNameDefaultExport');
    });

    test('should be taken from named export when default export is an HOC', () => {
      const [parsed] = parse(fixturePath('StatelessDisplayNameHOC'));
      assert.equal(parsed.displayName, 'StatelessDisplayName');
    });

    test('should be taken from named export when default export is an HOC', () => {
      const [parsed] = parse(fixturePath('StatefulDisplayNameHOC'));
      assert.equal(parsed.displayName, 'StatefulDisplayName');
    });

    test('should be taken from stateless component folder name if file name is "index"', () => {
      const [parsed] = parse(fixturePath('StatelessDisplayNameFolder/index'));
      assert.equal(parsed.displayName, 'StatelessDisplayNameFolder');
    });

    test('should be taken from stateful component folder name if file name is "index"', () => {
      const [parsed] = parse(fixturePath('StatefulDisplayNameFolder/index'));
      assert.equal(parsed.displayName, 'StatefulDisplayNameFolder');
    });
  });

  describe('Parser options', () => {
    describe('Property filtering', () => {
      describe('children', () => {
        test('should ignore property "children" if not explicitly documented', () => {
          check(
            'Column',
            {
              Column: {
                prop1: { type: 'string', required: false },
                prop2: { type: 'number' },
                prop3: { type: '() => void' },
                prop4: { type: '"option1" | "option2" | "option3"' }
              }
            },
            true
          );
        });

        test('should not ignore any property that is documented explicitly', () => {
          check(
            'ColumnWithAnnotatedChildren',
            {
              Column: {
                children: {
                  description: 'children description',
                  required: false,
                  type: 'ReactNode'
                },
                prop1: { type: 'string', required: false },
                prop2: { type: 'number' },
                prop3: { type: '() => void' },
                prop4: { type: '"option1" | "option2" | "option3"' }
              }
            },
            true
          );
        });
      });

      describe('propsFilter method', () => {
        test('should apply filter function and filter components accordingly', () => {
          const propFilter: PropFilter = (prop, component) =>
            prop.name !== 'prop1';
          check(
            'Column',
            {
              Column: {
                prop2: { type: 'number' },
                prop3: { type: '() => void' },
                prop4: { type: '"option1" | "option2" | "option3"' }
              }
            },
            true,
            undefined,
            { propFilter }
          );
        });

        test('should apply filter function and filter components accordingly', () => {
          const propFilter: PropFilter = (prop, component) => {
            if (component.name === 'Column') {
              return prop.name !== 'prop1';
            }
            return true;
          };
          check(
            'Column',
            {
              Column: {
                prop2: { type: 'number' },
                prop3: { type: '() => void' },
                prop4: { type: '"option1" | "option2" | "option3"' }
              }
            },
            true,
            undefined,
            { propFilter }
          );
          check(
            'AppMenu',
            {
              AppMenu: {
                menu: { type: 'any' }
              }
            },
            true,
            undefined,
            { propFilter }
          );
        });

        test('should allow filtering by parent interface', () => {
          const propFilter: PropFilter = (prop, component) => {
            if (prop.parent == null) {
              return true;
            }

            return (
              prop.parent.fileName.indexOf('@types/react') < 0 &&
              prop.parent.name !== 'HTMLAttributes'
            );
          };

          check(
            'ColumnWithHtmlAttributes',
            {
              Column: {
                prop1: { type: 'string', required: false },
                prop2: { type: 'number' }
              }
            },
            true,
            undefined,
            { propFilter }
          );
        });
      });

      describe('skipPropsWithName', () => {
        test('should skip a single property in skipPropsWithName', () => {
          const propFilter = { skipPropsWithName: 'prop1' };
          check(
            'Column',
            {
              Column: {
                prop2: { type: 'number' },
                prop3: { type: '() => void' },
                prop4: { type: '"option1" | "option2" | "option3"' }
              }
            },
            true,
            undefined,
            { propFilter }
          );
        });

        test('should skip multiple properties in skipPropsWithName', () => {
          const propFilter = { skipPropsWithName: ['prop1', 'prop2'] };
          check(
            'Column',
            {
              Column: {
                prop3: { type: '() => void' },
                prop4: { type: '"option1" | "option2" | "option3"' }
              }
            },
            true,
            undefined,
            { propFilter }
          );
        });
      });

      describe('skipPropsWithoutDoc', () => {
        test('should skip a properties without documentation', () => {
          const propFilter = { skipPropsWithoutDoc: false };
          check(
            'ColumnWithUndocumentedProps',
            {
              Column: {
                prop1: { type: 'string', required: false },
                prop2: { type: 'number' }
              }
            },
            true,
            undefined,
            { propFilter }
          );
        });
      });
    });

    describe('Extracting literal values from enums', () => {
      test('extracts literal values from enum', () => {
        check(
          'ExtractLiteralValuesFromEnum',
          {
            ExtractLiteralValuesFromEnum: {
              sampleBoolean: { type: 'boolean' },
              sampleComplexUnion: { type: 'number | "string1" | "string2"' },
              sampleEnum: {
                raw: 'sampleEnum',
                type: 'enum',
                value: [
                  { value: '"one"' },
                  { value: '"two"' },
                  { value: '"three"' }
                ]
              },
              sampleString: { type: 'string' },
              sampleStringUnion: {
                raw: '"string1" | "string2"',
                type: 'enum',
                value: [{ value: '"string1"' }, { value: '"string2"' }]
              }
            }
          },
          true,
          null,
          {
            shouldExtractLiteralValuesFromEnum: true
          }
        );
      });
    });
  });

  describe('withCustomConfig', () => {
    test('should accept tsconfigs that typescript accepts', () => {
      assert.ok(
        withCustomConfig(
          // need to navigate to root because tests run on compiled tests
          // and tsc does not include json files
          path.join(__dirname, '../../src/__tests__/data/tsconfig.json'),
          {}
        )
      );
    });
  });

  describe('parseWithProgramProvider', () => {
    test('should accept existing ts.Program instance', () => {
      let programProviderInvoked = false;

      // mimic a third party library providing a ts.Program instance.
      const programProvider = () => {
        // need to navigate to root because tests run on compiled tests
        // and tsc does not include json files
        const tsconfigPath = path.join(
          __dirname,
          '../../src/__tests__/data/tsconfig.json'
        );
        const basePath = path.dirname(tsconfigPath);

        const { config, error } = ts.readConfigFile(tsconfigPath, filename =>
          fs.readFileSync(filename, 'utf8')
        );
        assert.isUndefined(error);

        const { options, errors } = ts.parseJsonConfigFileContent(
          config,
          ts.sys,
          basePath,
          {},
          tsconfigPath
        );
        assert.lengthOf(errors, 0);

        programProviderInvoked = true;

        return ts.createProgram([fixturePath('Column')], options);
      };

      const result = withDefaultConfig().parseWithProgramProvider(
        [fixturePath('Column')],
        programProvider
      );

      checkComponent(
        result,
        {
          Column: {}
        },
        false
      );
      assert.isTrue(programProviderInvoked);
    });
  });

  describe('componentNameResolver', () => {
    test('should override default behavior', () => {
      const [parsed] = parse(
        fixturePath('StatelessDisplayNameStyledComponent'),
        {
          componentNameResolver: (exp, source) =>
            exp.getName() === 'StyledComponentClass' &&
            getDefaultExportForFile(source)
        }
      );
      assert.equal(parsed.displayName, 'StatelessDisplayNameStyledComponent');
    });

    test('should fallback to default behavior without a match', () => {
      const [parsed] = parse(
        fixturePath('StatelessDisplayNameStyledComponent'),
        {
          componentNameResolver: () => false
        }
      );
      assert.equal(parsed.displayName, 'StatelessDisplayNameStyledComponent');
    });
  });

  describe('methods', () => {
    test('should properly parse methods', () => {
      const [parsed] = parse(fixturePath('ColumnWithMethods'));
      const methods = parsed.methods;
      const myCoolMethod = methods[0];

      assert.equal(myCoolMethod.description, 'My super cool method');
      assert.equal(
        myCoolMethod.docblock,
        'My super cool method\n@param myParam Documentation for parameter 1\n@public\n@returns The answer to the universe'
      ); // tslint:disable-line max-line-length
      assert.deepEqual(myCoolMethod.modifiers, []);
      assert.equal(myCoolMethod.name, 'myCoolMethod');
      assert.deepEqual(myCoolMethod.params, [
        {
          description: 'Documentation for parameter 1',
          name: 'myParam',
          type: { name: 'number' }
        },
        {
          description: null,
          name: 'mySecondParam?',
          type: { name: 'string' }
        }
      ]);
      assert.deepEqual(myCoolMethod.returns, {
        description: 'The answer to the universe',
        type: 'number'
      });
    });

    test('should properly parse static methods', () => {
      const [parsed] = parse(fixturePath('ColumnWithStaticMethods'));
      const methods = parsed.methods;

      assert.equal(methods[0].name, 'myStaticMethod');
      assert.deepEqual(methods[0].modifiers, ['static']);
    });

    test('should handle method with no information', () => {
      const [parsed] = parse(fixturePath('ColumnWithMethods'));
      const methods = parsed.methods;
      assert.equal(methods[1].name, 'myBasicMethod');
    });

    test('should handle arrow function', () => {
      const [parsed] = parse(fixturePath('ColumnWithMethods'));
      const methods = parsed.methods;
      assert.equal(methods[2].name, 'myArrowFunction');
    });

    test('should not parse functions not marked with @public', () => {
      const [parsed] = parse(fixturePath('ColumnWithMethods'));
      const methods = parsed.methods;
      assert.equal(
        Boolean(methods.find(method => method.name === 'myPrivateFunction')),
        false
      );
    });
  });

  describe('getDefaultExportForFile', () => {
    test('should filter out forbidden symbols', () => {
      const result = getDefaultExportForFile({
        fileName: 'a-b'
      } as ts.SourceFile);
      assert.equal(result, 'ab');
    });

    test('should remove leading non-letters', () => {
      const result = getDefaultExportForFile({
        fileName: '---123aba'
      } as ts.SourceFile);
      assert.equal(result, 'aba');
    });

    test('should preserve numbers in the middle', () => {
      const result = getDefaultExportForFile({
        fileName: '1Body2Text3'
      } as ts.SourceFile);
      assert.equal(result, 'Body2Text3');
    });

    test('should not return empty string', () => {
      const result = getDefaultExportForFile({
        fileName: '---123'
      } as ts.SourceFile);
      assert.equal(result.length > 0, true);
    });
  });

  describe('issues tests', () => {
    test('188', () => {
      check(
        'Issue188',
        {
          Header: {
            content: { type: 'string', required: true, description: '' }
          }
        },
        true,
        ''
      );
    });
  });
});
