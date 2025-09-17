import { chalkStderr as chalk } from 'chalk';
import { emojify as emoji } from 'node-emoji';
import { execSync } from 'node:child_process';
import { default as yoctoSpinner } from 'yocto-spinner';

// Helper function to run shell commands and return the output
function runCommand(command) {
  try {
    console.info(chalk.blue(`Running command: ${command}`)); // Log command for debugging
    return execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    console.error(chalk.red(`Error while executing command: ${command}`));
    return error.message;
  }
}

// Get the list of staged files that are added or modified
function getStagedFiles() {
  const result = runCommand('git diff --cached --name-only');
  return result.split('\n').filter((file) => file); // Remove empty lines
}

// Main function that runs checks and fixes on modified files
(async () => {
  const spinner = yoctoSpinner().start(
    'Running CI checks on modified files...',
  );

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.info(chalk.yellow(emoji('⚠️') + ' No staged files to check.'));
    spinner.stop();
    return;
  }

  // Filter for JavaScript/TypeScript files or any other file types you'd like to check
  const filesToCheck = stagedFiles.filter(
    (file) =>
      file.endsWith('.js') ||
      file.endsWith('.ts') ||
      file.endsWith('.jsx') ||
      file.endsWith('.tsx'),
  );

  if (filesToCheck.length === 0) {
    console.info(
      chalk.yellow(emoji('⚠️') + ' No JavaScript/TypeScript files staged.'),
    );
    spinner.stop();
    return;
  }

  try {
    // Run lint check only on specific files
    spinner.start('Running lint check...');
    const lintResult = runCommand(`npm run lint -- ${filesToCheck.join(' ')}`);
    spinner.success(chalk.green(emoji('✅') + ' Lint checks passed!'));

    // Run fix command only on specific files if needed
    spinner.start('Applying fixes...');
    const fixResult = runCommand(
      `npm run lint:fix -- ${filesToCheck.join(' ')}`,
    );
    spinner.success(chalk.green(emoji('⚙️') + ' Fixes applied successfully!'));

    // Output results
    console.info(
      chalk.blue(emoji('💻') + ' Lint check output:\n') +
        chalk.gray(lintResult),
    );
    console.info(
      chalk.blue(emoji('🔧') + ' Fix output:\n') + chalk.gray(fixResult),
    );
    console.info(
      chalk.cyan(emoji('🚀') + ' All checks passed and fixes applied!'),
    );
  } catch (error) {
    spinner.error(chalk.red(emoji('❌') + ' An error occurred.'));
    console.error(chalk.red(error));
  }
})();
