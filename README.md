<p align="center">
    <h1 align="center">iAnalyzer</h1>
</p>

<p align="center">A versatile code analysis tool for JavaScript, HTML, CSS, Angular, React, Vue, and ES6. iAnalyzer ensures code quality through ESLint rules linting with inbuilt profiles, integrates with Sonar for in-depth analysis,  enforces a consistent code style across your entire codebase via Prettier. Your all-in-one solution for maintaining high-quality and efficient code.</p>

## Getting Started

### Installation

To install iAnalyzer locally in your project, you need to run the below command:

- Use npm to install the iAnalyzer

<pre><code>npm install ianalyzer</code></pre>

whereas for global installation, the user needs to add '-g' to the above command.

**Initialize iAnalyzer in your project**

- Open your project in a terminal and run following command to get multiple configuration options

<pre><code>npm run ianalyzer --init</code></pre>

### Execution

**Run iAnalyzer in your project**

- To perform linting on your project execute the below command.

<pre><code>npm run ianalyzer</code></pre>

**Fix Lint issues (auto fixable) in your project**

- To auto fix linting issues on your project execute the below command.

<pre><code>npm run ianalyzer-fix</code></pre>

The linting behavior can be modified through the below command, presented in .uxplinterrc file.

<pre><code>npm run ianalyzer --fix</code></pre>

### Reports

- To generate a linting report execute below command.

<pre><code>npm run ianalyzer-report</code></pre>

Once the above command gets executed, Users can opt for a report format. Default selected report format is `HTML`.

The linting report behavior can be modified through the below command, presented in .uxplinterrc file.

<pre><code>"jsReportCommand": "eslint --quiet --ext js,jsx,snap,md,ts,tsx,vue $path"</code></pre>

The linting behavior can be modified through the below command, presented in .uxplinterrc file.

<pre><code>"jsLintCommand": "eslint --ext ts,tsx,js,jsx,vue $path"</code></pre>


### Profile

By default, the package provides an 'essential' profile for linting. This profile has a limited set of rules.
Users can run `ianalyzer-init` anytime for updating the profile.

### Uninstall iAnalyzer

To remove a partial or complete package, run the `ianalyzer-init` command and select an appropriate option.


## Requirements

**Node:**

iAnalyzer only supports maintenance and LTS versions of Node.js. Please refer to the <a href="https://nodejs.org/en/about/releases/">Node.js release schedule</a> for more information. NPM versions installed by default with Node.js are supported.

| iAnalyzer Version | Recommended | Minimum |
| ---------------   | ----------- | ------- |
| 2.0               | 16.x        | 14.x    | 

**ESLint:**

| iAnalyzer Version | Recommended | Minimum |
| ---------------   | ----------- | ------- |
| 2.0               | >=6.x.x     | 6.x.x   | 

**@babel/eslint-parser:**

| iAnalyzer Version | Recommended | Minimum |
| ---------------   | ----------- | ------- |
| 2.0               | Latest      | 7.19.1  | 

**babel-eslint:**

| iAnalyzer Version | Recommended | Minimum |
| ---------------   | ----------- | ------- |
| 2.0               | 10.1.0      | 10.1.0  | 


## Features

- **Zero Configuration**

    <i>Just install & it's ready to use!</i>

    No hassle of adding the .eslintrc configuration file or adding the required scripts in package.json to set up the analyzer. Just install the iAnalyzer, and everything is automatically configured with the installation. With the zero config setup, iAnalyzer provides the easiest way to enforce consistent styles in the codebase.

- **Linting Support**

    <i>Looking for linting support?</i>

    iAnalyzer provides support for JavaScript, TypeScript,HTML and CSS linting.

    ![alt text](./assets/images/Linting%20Options.PNG)

    Along with provides an option to choose  the linter based on the project need. Just need to answer a question before installation and you are good to go.

    ![alt text](./assets/images/Framework%20Options.PNG)

- **Automatic code fixing**

    <i>Need to automatically fix the linting errors?</i>

    Just run the command ianalyzer-fix & save your time to fix the liting errors automatically.

    ![alt text](./assets/images/Auto%20Fix.PNG)

- **Automatic code formatting**

    <i>Need to automatically format the code?</i>

    Just install Prettier and execute ianalyzer-run command to apply code formatting in the code.

    ![alt text](./assets/images/Auto%20Format.PNG)

- **Linting Report**

    <i>Want to see linting reports or need to share with the team?</i>

    No worries! iAnalyzer provides the reports in different available formats, just a single update for the format in the scripts, and you get the linting report in the format of your choice.

    ![alt text](./assets/images/Report%20Options.PNG)

- **Linting Profile**

    <i>Afraid of linting, due to thousands of linting errors?</i>

    No worries! iAnalyzer offers the rules that define the best practices into namely 4 categories - Essential, Recommended, Sonar and Custom. It doesn’t enforce hundreds of rules on the codebase all at once, instead it offers us the flexibility to choose from the categories, and scale up as and when one feels comfortable with the existing category.

    ![alt text](./assets/images/Profile%20Options.PNG)

## Roadmap

- Staged file support for linting
- Performance testing
- Security testing
- Accessibility testing
- Frontend Dashboard
- VS code extension
