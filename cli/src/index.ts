import { program } from 'commander';

program
    .name('spd')
    .description('Interface with Spaced API endpoints.')
    .version('v1beta1');


/* Authentication */
program.command('login')
    .argument('<email>', 'Email address.')
    .description('Login to Spaced API.')
    .action((email, password) => console.log(`Logging in as ${email}...`));

/* Library */
program.command('upload')
    .argument('<path>', 'Path to media file or folder.')
    .description('Encrypt and upload media to your Spaced library.')
    .action((path) => console.log(`Uploading media from ${path}...`));

program.command('download')
    .argument('<id>', 'Unique ID of the media.')
    .argument('<dest>', 'Name of the file or folder to write to.')
    .description('Download encrypted media from your Spaced library and decrypt it.')
    .action((id, dest) => console.log(`Downloading media with ID ${id} to ${dest}...`));

const space = program.command('space')
    .description('Manage your spaces.');

space.command('list')
    .description('List your spaces.')
    .option('-p, --page <page>', 'Page number.', '1')
    .action((page) => console.log(`Listing spaces on page ${page}...`));

space.command('search')
    .argument('<query>', 'Search query.')
    .description('Search for public spaces.')
    .action((query) => console.log(`Searching for spaces with query ${query}...`));

space.command('create')
    .argument('<name>', 'Name of the space.')
    .option('-d, --description <description>', 'Description of the space.')
    .option('-p, --public', 'Make the space public. Public spaces are visible to everyone.')
    .description('Create a new space.')
    .action((name, options) => console.log(`Creating space ${name}...`));

space.command('delete')
    .argument('<id>', 'Unique ID of the space.')
    .description('Delete a space.')
    .action((id) => console.log(`Deleting space with ID ${id}...`));

space.command('join')
    .argument('<name>', 'Unique name of the public space.')
    .description('Join a public space.')
    .action((id) => console.log(`Joining space with ID ${id}...`));

space.command('leave')
    .argument('<name>', 'Unique name of the space.')
    .description('Leave a space.')
    .action((id) => console.log(`Leaving space with ID ${id}...`));

program.command('publish')
    .argument('<id>', 'Unique ID of the media.')
    .argument('<space>', 'Unique name of the space.')
    .option('-d, --description <description>', 'Description of the media.')
    .option('-t, --tags <tags>', 'Comma-separated list of tags.')
    .description('Publish media to a space.')
    .action((id, space, options) => console.log(`Publishing media with ID ${id} to space ${space}...`));

program.command('unpublish')
    .argument('<id>', 'Unique ID of the media.')
    .argument('<space>', 'Unique name of the space.')
    .description('Unpublish media from a space.')
    .action((id, space) => console.log(`Unpublishing media with ID ${id} from space ${space}...`));

// TODO: how do I have visibility on what items have been published to a space?


program.parse(process.argv);