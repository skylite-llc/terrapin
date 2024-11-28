'use strict'

const chalk = require('chalk')
const { program } = require('commander')
const path = require('path')
const fs = require('fs')
const prompt = require('prompt-promise');
const config = require('../.toolingconfig.json')
const pluralize = require('pluralize')
const prettier = require('prettier');
const { ESLint } = require('eslint');

const EXT = "ts"
const toCamelCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);

const formatFilesRecursively = async (dirPath, prettierOptions) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await formatFilesRecursively(fullPath, prettierOptions);
    } else if (entry.isFile()) {
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const formattedContent = await prettier.format(fileContent, {
        ...prettierOptions,
        filepath: fullPath,
        silent: true
      });
      fs.writeFileSync(fullPath, formattedContent, 'utf-8');
    }
  }
};


/**
 *
 */
const findEntityPath = (baseDir, entityName) => {
  const files = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.resolve(baseDir, file.name);
    if (file.isDirectory()) {
      const nestedPath = findEntityPath(fullPath, entityName);
      if (nestedPath) return nestedPath;
    } else if (file.name === `${entityName}.entity.ts`) {
      return fullPath;
    }
  }
  return null;
};


/**
 * Helpers
 * @param className
 * @param relationType
 * @param fieldName
 * @param isOwner
 * @returns {string}
 */
const getReverseRelationCode = (className, relationType, fieldName) => {
  const camelClass = toCamelCase(className);
  const pluralizedClass = pluralize(camelClass);

  switch (relationType) {
    case 'many-to-one':
      return `@OneToMany(() => ${className}, ${toCamelCase(className)} => ${toCamelCase(className)}.${fieldName})
    @Index()
    ${pluralizedClass} = new Collection<${className}>(this);
    `;

    case 'one-to-many':
      return `@ManyToOne(() => ${className})
    @Index()
    ${camelClass}: ${className};
    `;

    case 'many-to-many':
      return `@ManyToMany(() => ${className})
    ${pluralizedClass} = new Collection<${className}>(this); 
    `;

    case 'one-to-one':
      return `@OneToOne(() => ${className}, ${camelClass} => ${camelClass}.${fieldName})
    @Index()
    ${camelClass}: ${className};
    `;

    default:
      throw new Error(`Unknown relation type: ${relationType}`);
  }
};



/**
 * Adds a reverse relationship definition to the content of a file for the given entity and relation type.
 *
 * @param {string} content - The original content of the file.
 * @param {string} relatedEntity - The entity class that the relationship is related to.
 * @param {string} className - The name of the main entity class.
 * @param {string} relationType - The type of the relationship (e.g., 'many-to-one', 'one-to-many', 'many-to-many', or 'one-to-one').
 * @param {string} fieldName - The field name to be used in the relationship definition.
 * @param {string}  relativePath - The relative import path
 * @return {string} Updated content with the reverse relationship added.
 */
const addReverseRelationToFile = (content, relatedEntity, className, relationType, fieldName, relativePath) => {
  const reverseRelationCode = getReverseRelationCode(className, relationType, fieldName);
  const imports = new Set();
  const mainEntityImport = `import ${className} from '@models/${relativePath.replace(".ts", "")}';`;

  // Add necessary imports
  if (!new RegExp(`^${mainEntityImport}$`, 'm').test(content)) {
    imports.add(mainEntityImport);
  }
  switch (relationType) {
    case 'many-to-one':
      if (!content.includes('OneToMany')) imports.add("import { OneToMany } from '@mikro-orm/core';");
      if (!content.includes('Collection')) imports.add("import { Collection } from '@mikro-orm/core';");
      if (!content.includes('Index')) imports.add("import { Index } from '@mikro-orm/core';");
      break;
    case 'one-to-many':
      if (!content.includes('ManyToOne')) imports.add("import { ManyToOne } from '@mikro-orm/core';");
      if (!content.includes('Index')) imports.add("import { Index } from '@mikro-orm/core';");
      break;
    case 'many-to-many':
      if (!content.includes('ManyToMany')) imports.add("import { ManyToMany } from '@mikro-orm/core';");
      if (!content.includes('Collection')) imports.add("import { Collection } from '@mikro-orm/core';");
      if (!content.includes('Index')) imports.add("import { Index } from '@mikro-orm/core';");
      break;
    case 'one-to-one':
      if (!content.includes('OneToOne')) imports.add("import { OneToOne } from '@mikro-orm/core';");
      if (!content.includes('Index')) imports.add("import { Index } from '@mikro-orm/core';");
      break;
    default:
      throw new Error(`Unknown relation type: ${relationType}`);
  }

  // Insert imports if not present
  const importStatements = Array.from(imports)
    .filter(importStatement => !new RegExp(`^${importStatement}$`, 'm').test(content))
    .join('\n');
  content = `${importStatements}\n${content}`;

  // Add inverse relation at the end of the class
  content = content.replace(
    /(\}\s*)$/,
    `\n    ${reverseRelationCode}\n$1`
  );

  return content;
};



const log = console.log
const splitFilename = filename => filename.split("/").pop()
const splitDirectories = filename => filename.split("/").slice(0, -1)
const capitalizeString = string =>  string.charAt(0).toUpperCase() + string.slice(1)
const exitWithError = errorMessage => {
  log(
    chalk
      .red
      .bold(`❌ ${errorMessage ?? "A general error occurred."}`)
  )
  process.exit(0)
}

/**
 * Runs a template creation command
 * @param args
 * @param options
 * @return {Promise<void>}
 */
const run = async (args, options) => {
  const defaultError = "Template is not defined."
  if(!args.length) exitWithError(
    defaultError
  )
  if(!config.enabled_templates.includes(args[0])) exitWithError(
    defaultError
  )
  if(args.length < 2) exitWithError(
    "No filename was defined for the template."
  )

  const template = args[0];

  const classname = splitFilename(args[1])
  const filename = splitFilename(args[1]) + `${template === 'model' ? '.entity' : ''}`
  const fileDirectories = splitDirectories(args[1])
  const capitalizedTemplateName = capitalizeString(template)
  const pluralizedTemplate = pluralize(template)
  const storeLocation = path.resolve(
    `${config.locations[capitalizedTemplateName]}${fileDirectories.length ? "/"+fileDirectories.join("/") : ""}`
  )
  let override;
  if(fs.existsSync(storeLocation + "/" + filename + `.ts`)) {
    const loc = chalk.yellow.bold(storeLocation + "/" + filename + `.ts`)
    const warningMsg = chalk.red.bold("Do you wish to overwrite this file?" +
      "  Y/n:  ")
    override = await prompt(
      `⚠️  The file ${loc} already exists.\n\n${warningMsg}`
    )
      .then(val => val === "Y" ? val : "n")
  }

  if(
    override === "n"
  ) exitWithError("Operation cancelled")

  if(
    override === "Y"
  ) fs.rmSync(storeLocation + "/" + filename + ".ts")

  let extendFromInclude, extendFromFilename

  if(options.extend) {
    let extensionTemplate = config.extensions[capitalizedTemplateName]
    extendFromFilename = splitFilename(extensionTemplate)
    extendFromInclude = `extends ${extendFromFilename.split(".")[0]}`
  }

  let fileTemplate = fs.readFileSync(
    path.resolve(`__stubs/${capitalizedTemplateName}.txt`)
  ).toString()

  let msgColor = "greenBright"
  if(override === "Y") msgColor = "yellow"

  log(
    chalk
      [msgColor]
      .bold(
        `${override !== "Y" ? "🚀    Creating new" : "⬆️   Updating existing"} ${capitalizedTemplateName} called ${filename} ${fileDirectories.length ? "in" +
        ` the directory ${fileDirectories.join("/")}` : ""} ${options.extend ? "extended" +
        ` from ${extendFromFilename}` : ""}`)
  )

  if (template === 'model') {
    const className = capitalizeString(classname);
    const primaryKey = options.primaryKey || 'id';
    fileTemplate = fileTemplate.replaceAll("ENTITY_NAME", className);
    fileTemplate = fileTemplate.replaceAll("PRIMARY_KEY_NAME", `${primaryKey}`);

    const primaryKeyType = options.primaryType || 'string';
    fileTemplate = fileTemplate.replace("PRIMARY_KEY_TYPE", primaryKeyType);

    const imports = new Set();
    imports.add("import { Entity, PrimaryKey, Property } from '@mikro-orm/core';");

    let classContent = `@Entity()
export default class ${className} {

    @PrimaryKey()
    ${primaryKey}: ${primaryKeyType};
    `;

    if (options.timestamps) {
      classContent += `
    @Property({ onCreate: () => new Date() })
    createdAt: Date;

    @Property({ onUpdate: () => new Date() })
    modifiedAt: Date;
    ${options.softDelete ? `
    
    @Property({ nullable: true })
    deletedAt?: Date;
    ` : ''}`;
    }

    if (options.unique) {
      const uniqueFields = options.unique.split(',').map(field => field.trim()).join(', ');
      classContent += `\n    @Unique([${uniqueFields}])\n`;
    }

    if (options.index) {
      const indexFields = options.index.split(',').map(field => field.trim());
      indexFields.forEach(field => {
        classContent += `\n    @Index()\n    @Property()\n    ${field}: string;
        `;
      });
    }

    if (options.properties) {
      const properties = options.properties.split(',').map(prop => prop.trim());

      properties.forEach(property => {
        const [propertyName, propertyType] = property.split(':').map(str => str.trim());

        if (!['string', 'number', 'boolean', 'Date'].includes(propertyType)) {
          imports.add(`import ${propertyType} from './${propertyType}';`);
        }

        classContent += `
    @Property()
    ${propertyName}: ${propertyType};
    `;
      });
    }

    let relationshipsContent = '';

    if (options.relations) {
      const relations = options.relations.split(',').map(relation => relation.trim());
      let isOwner = true;

      relations.forEach(relation => {
        const [fieldName, relatedEntity, relationType] = relation.split(':').map(str => str.trim());
        const relatedEntityPath = findEntityPath(path.resolve('./src/domain/models'), relatedEntity);
        if (!relatedEntityPath) {
          console.warn(chalk.yellow(`⚠️  Warning: Related entity file ${relatedEntity}.entity.ts does not exist. Proceeding without import.`));
        } else {

          const relativeImportPath = path.relative(path.dirname(storeLocation), relatedEntityPath).replace(/\\/g, '/').replace("models", "");
          imports.add(`import ${relatedEntity} from '@models/${relativeImportPath.replace(".ts", "")}';`);

          const relatedEntityFileContent = fs.readFileSync(relatedEntityPath, 'utf8');
          const updatedRelatedEntityContent = addReverseRelationToFile(
            relatedEntityFileContent,
            relatedEntity,
            className,
            relationType,
            fieldName,
            fileDirectories.join("/") +  "/" + className + ".entity"
          );
          fs.writeFileSync(relatedEntityPath, updatedRelatedEntityContent);
        }

        switch (relationType) {
          case 'many-to-one':
            imports.add("import { ManyToOne } from '@mikro-orm/core';");
            if (!Array.from(imports).some(imp => imp.includes('Index'))) {
              imports.add("import { Index } from '@mikro-orm/core';");
            }
            relationshipsContent += `
    @ManyToOne(() => ${relatedEntity})
    @Index()
    ${fieldName}: ${relatedEntity};
    `;
            break;

          case 'one-to-many':
            if (!Array.from(imports).some(imp => imp.includes('Collection'))) {
              imports.add("import { OneToMany, Collection } from '@mikro-orm/core';");
            } else {
              imports.add("import { OneToMany } from '@mikro-orm/core';");
            }
            if (!Array.from(imports).some(imp => imp.includes('Index'))) {
              imports.add("import { Index } from '@mikro-orm/core';");
            }
            relationshipsContent += `
    @OneToMany(() => ${relatedEntity}, ${toCamelCase(relatedEntity)} => ${toCamelCase(relatedEntity)}.${toCamelCase(className)})
    @Index()
    ${fieldName} = new Collection<${relatedEntity}>(this);
`;
            break;

          case 'many-to-many':
            if (!Array.from(imports).some(imp => imp.includes('Collection'))) {
              imports.add("import { ManyToMany, Collection } from '@mikro-orm/core';");
            } else {
              imports.add("import { ManyToMany } from '@mikro-orm/core';");
            }
            if (!Array.from(imports).some(imp => imp.includes('Index'))) {
              imports.add("import { Index } from '@mikro-orm/core';");
            }

            relationshipsContent += `
    @ManyToMany(() => ${relatedEntity}, ${isOwner ? `${fieldName} => ${fieldName}.${pluralize(toCamelCase(className))}` : ''})
    @Index()  
    ${pluralize(fieldName)} = new Collection<${relatedEntity}>(this);
`;
            break;

          case 'one-to-one':
            imports.add("import { OneToOne } from '@mikro-orm/core';");
            if (!Array.from(imports).some(imp => imp.includes('Index'))) {
              imports.add("import { Index } from '@mikro-orm/core';");
            }
            const ownerRelation = className === args[1] ? `{ owner: true }` : '';
            relationshipsContent += `
    @OneToOne(() => ${relatedEntity}, ${fieldName} => ${fieldName}.${toCamelCase(className)}, ${ownerRelation})
    @Index()
    ${fieldName}: ${relatedEntity};
`;

            break;
        }
        isOwner = false;
      });
    }

    classContent += relationshipsContent;


    classContent += `
}
    `;
    const importStatements = Array.from(imports).join('\n');
    fileTemplate = `${importStatements}\n\n${classContent}`;
  }

  fileTemplate = fileTemplate.replaceAll(
    `${capitalizedTemplateName.toUpperCase()}_NAME`,
    filename
  )

  if(options.extend) {
    fileTemplate = fileTemplate
      .replaceAll("EXTENSION", extendFromInclude)
      .replaceAll("SUPER",
        `${template === 'controller' ? "super(res)" : "super()"}`
      )
    fileTemplate =  `import ${extendFromFilename.split(".")[0]} from "${
      path.relative(
        storeLocation,
        config.extensions[capitalizedTemplateName]
      )
    }"\n\n`
      .concat(fileTemplate)
  } else {
    fileTemplate = fileTemplate
      .replaceAll("EXTENSION", "")
      .replaceAll("SUPER", "")
  }

  log(
    chalk
      .green
      .bold("☁️✈️    Template assembled")
  )

  if (!fs.existsSync(storeLocation)) fs.mkdirSync(
    storeLocation,
    { recursive: true }
  )
  fs.writeFileSync(
    storeLocation + "/" + filename + `.${EXT}`,
    fileTemplate
  )

  const manifestFile = path.resolve(
    config.locations[capitalizedTemplateName]+`/index.${EXT}`
  )

  if(fs.existsSync(manifestFile)) {
    const contents = fs.readFileSync(manifestFile)
    const updatedContents = `import ${filename} from "@${pluralizedTemplate}/${fileDirectories.length ? fileDirectories.join("/") + "/" : ""}${filename}"\n${contents}`
    let char = ",";
    if(!updatedContents.toString().includes(",")) char = "]"

    const lastIndexOfComma = updatedContents.toString().lastIndexOf(char)
    const insertedClassContents = updatedContents.slice(0, lastIndexOfComma)
      + `,\n  ${filename}` + `${char === "]" ? ",\n" : ""}` + updatedContents.slice(lastIndexOfComma)
    fs.writeFileSync(
      manifestFile,
      insertedClassContents
    )
  }

  return {
    storeLocation,
    filename
  };
}

/**
 * Program Options and Data Receive
 */
program
  .argument('<template>', "the template to create")
  .option('--extend')
  .option('--properties <properties>', 'A comma-separated list of properties' +
    ' to' +
    ' include')
  .option('--timestamps', 'Include timestamps for auditing')
  .option('--softDelete', 'Include soft delete functionality')
  .option('--primaryKey <key>', 'Specify a custom primary key')
  .option('--primaryType <type>', 'Specify primary key type (e.g., string, number)')
  .option('--unique <fields>', 'Comma-separated list of unique fields')
  .option('--index <fields>', 'Comma-separated list of indexed fields')
  .option('--tableName <name>', 'Specify a custom table name')
  .option('--relations <relations>', 'Comma-separated list of relations');


program.parse();

const options = program.opts();
const args = program.args;

/**
 * Execute
 */
run(args, options)
.then(async({storeLocation}) => {
  const prettierOptions = {
    "trailingComma": "all",
    "tabWidth": 2,
    "semi": false,
    "singleQuote": true,
    "parser": "typescript",
    "printWidth": 80,
    "singleAttributePerLine": true,
    "bracketSpacing": true,
    "bracketSameLine": false,
    "arrowParens": "avoid"
  };
  await formatFilesRecursively(storeLocation, prettierOptions);
  process.exit(0);
})
.catch((error) => {
  console.error(chalk.red.bold(`❌ Error: ${error.message}`));
  process.exit(1);
});
