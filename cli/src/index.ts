#!/usr/bin/env node

import { program } from "commander";
import initialize from './cmd/init';
import runCommand from './lib/command';
import { uploadMedia } from './cmd/media';

program
    .name("spaced")
    .description("CLI tool for interfacing with Spaced API.")
    .version("v1beta1");

program.command("init")
    .description("Initialize Spaced CLI.")
    // we don't wrap init inside runCommand as it is the first command to be run
    .action(async () => initialize());

program.command("media upload")
    .description("CRUD operations for media.")
    .option("-p, --path <path>", "Path to media file.")
    .action(async (_name, options: { path: string }, _command) => runCommand(async () => uploadMedia(options.path)));

program.parse(process.argv);