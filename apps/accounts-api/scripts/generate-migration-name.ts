import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';

const migrationName = uniqueNamesGenerator({
  dictionaries: [adjectives, colors, animals],
  separator: '_',
  length: 3,
});

process.stdout.write(`${migrationName}\n`);
