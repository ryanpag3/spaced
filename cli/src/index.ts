import { program } from 'commander';

program
    .name('spd')
    .description('Interface with Spaced API endpoints.')
    .version('v1beta1');


/* Authentication */
program.command('login')
    .argument('<email>', 'Email address.')
    .argument('<password>', 'Password.')
    .description('Login to Spaced API.')
    .action((email, password) => console.log(`Logging in as ${email}...`));

program.command('logout')
    .description('Logout of Spaced API.')
    .action(() => console.log('Logging out...'));

/* Library */
program.command('upload')
    .argument('<path>', 'Path to media file or folder.')
    .description('Upload media to your Spaced library.')
    .action((path) => console.log(`Uploading media from ${path}...`));

program.command('download')
    .argument('<id>', 'Unique ID of the media.')
    .argument('<dest>', 'Name of the file to write to.')
    .description('Download media from your Spaced library.')
    .action((id, dest) => console.log(`Downloading media with ID ${id} to ${dest}...`));

/* Create Resource Operations */
const create = program.command('create')
    .description('Create operations.');

create.command('space')
    .argument('<name>', 'Name of the space.')
    .option('-d, --description <description>', 'Description of the space.')
    .option('-p, --public', 'Make the space public.')
    .description('Create a new space.')
    .action((name, options) => console.log(`Creating space ${name}...`));

/* List Resource Operations */
const list = program.command('list')
    .description('List operations.');

list.command('spaces')
    .description('List all spaces you own.')
    .action(() => console.log('Listing spaces...'));

/* Delete Resource Operations */
const del = program.command('delete')
    .description('Delete operations.');

del.command('space')
    .argument('<name>', 'Unique name of the space.')
    .description('Delete a space.')
    .action((name) => console.log(`Deleting space ${name}...`));

/* Update Resource Operations */
const update = program.command('update')
    .description('Update operations.');

update.command('space')
    .argument('<name>', 'Unique name of the space.')
    .option('-n, --new-name <newName>', 'New name of the space.')
    .option('-d, --description <description>', 'Description of the space.')
    .option('-p, --public', 'Make the space public.')
    .description('Update a space.')
    .action((name, options) => console.log(`Updating space ${name}...`));

/* Get Resource Operations */
const get = program.command('get')
    .description('Get operations.');

get.command('space')
    .argument('<name>', 'Unique name of the space.')
    .description('Get a space.')
    .action((name) => console.log(`Getting space ${name}...`));

program.parse(process.argv);