# Eksi Blocker

A Firefox extension that allows you to block posts from specific users on eksisozluk.com.

## Features

- Block posts from specific users with a blur effect
- Toggle visibility with a "Göster" (Show) button
- Customize your block list through an easy-to-use interface
- Blocked users are saved between browser sessions
- Import multiple users at once from a JSON file
- Export your block list to a JSON file for backup or sharing

## Usage

1. Click on the extension icon in the toolbar
2. Enter a username you want to block
3. Click "Ekle" (Add) or press Enter
4. To unblock a user, click "Kaldır" (Remove) next to their name
5. When browsing eksisozluk.com, posts from blocked users will be blurred
6. Click the "Göster" button to temporarily view the blurred content
7. Click "Gizle" to blur it again

### Importing Users from JSON

You can import multiple users at once with a JSON file:

1. Click "JSON'dan İçe Aktar" (Import from JSON) button in the popup
2. A new tab will open with the import interface
3. Create a JSON file with an array of usernames in one of these formats:
   ```json
   ["username1", "username2", "username3"]
   ```
   or
   ```json
   {
     "usernames": ["username1", "username2", "username3"]
   }
   ```
4. Click "JSON Dosyası Seçin" (Select JSON File) and choose your file
5. After validation, click "İçe Aktar" (Import) button
6. Users will be added to your block list

### Exporting Users to JSON

You can export your block list to a JSON file:

1. Click "JSON Olarak Dışa Aktar" (Export as JSON) button in the popup
2. A new tab will open with the export interface
3. Optionally enter a title for your export
4. Click "JSON Olarak Dışa Aktar" button
5. The file will be downloaded automatically in this format:
   ```json
   {
     "title": "Your Export Title",
     "usernames": ["username1", "username2", "username3"],
     "exportDate": "2023-01-01T12:00:00.000Z",
     "count": 3
   }
   ```
6. You can use this file to backup your list or import to another browser

## Installation

1. Download the extension files
2. Open Firefox and navigate to `about:debugging`
3. Click on "This Firefox" and then "Load Temporary Add-on"
4. Select any file from the extension directory

