# magnolia-cms-mailchimp-integration
A Magnolia CMS light module to integrate with Mailchimp.

The `mailchimp-connector` directory is a light module that you can use in your project.

The module requires Magnolia DX Core. Tested with Magnolia CMS 6.2.17.

For this light integration the following techniques have been used:
- [Rest Client Module](https://docs.magnolia-cms.com/product-docs/6.2/Modules/List-of-modules/REST-Client-module.html)
- [Backend Live](https://docs.magnolia-cms.com/backend-live/index.html)
- [Frontend Component](https://docs.magnolia-cms.com/product-docs/6.2/Developing/Templating.html)
---

## Functionality Overview
The functionality contains the following:
- Embedded sign-up form: The Mailchimp form to be added/embedded as a component in a page.

A content app that allows the user to manage campaigns and lists:
- Create, update, delete campaigns and lists
- Synchronize and schedule campaigns
- Synchronize lists information
- Batch import of new email accounts to a list

All data is originated from Mailchimp, so that makes Mailchimp the single source of truth. For this reason the synchronization functionality is used for Campaigns and Lists and the [Mailchimp Status](#Sync to Mailchimp Status) is used at the respective content apps.

## Features

* A Mailchimp list resource `REST Client` is configured
* A sign-up form component is configured in a way, that can be used to embed sign-up forms from your Mailchimp lists in pages

## Setup

_A Mailchimp account (Essentials pricing plan) with an active API key is required for this integration. For configuration of the Mailchimp account and generation of the API key refer to [Mailchimp Documentation](https://mailchimp.com/developer/marketing/guides/quick-start/#create-an-account)._

* Download and install the light module in a DX Core instance

The module requires the following parameters configured as environmental variables available to your server:
| Description | Key | Sample Value |
|---|---|---|
| [Mailchimp Server Prefix](https://mailchimp.com/developer/marketing/guides/quick-start/#make-your-first-api-call) | MAILCHIMP_SERVER_PREFIX | us10 |
| Mailchimp Username. Any applicable value is acceptable. Use a custom value to distinguish between installations and/or assist during potential error tracking/troubleshooting when contacting Mailchimp support. | MAILCHIMP_USERNAME | public-1 |
| The API key provided by Mailchimp. | MAILCHIMP_API_KEY | 0128901f0adc-us10 |

Additionally, you must set the `magnolia.yaml.envsubst` feature flag (JVM option) to `true`, in order for the variable values to be replaced. (Refer to [Environment Variables](https://docs.magnolia-cms.com/product-docs/6.2/Administration/Architecture/Configuration-management.html#_environment_variables))

---

# Contributors
[andreassyr](https://github.com/andreassyr)
[fotisfloros](https://github.com/fotisfloros)
[Kktheoch](https://github.com/Kktheoch)
[nickalven](https://github.com/nickalven)
[obagkrtzian](https://github.com/obagkrtzian)
[xrargiroudi](https://github.com/xrargiroudi)

---

# Sign-up Form Component

Import the component to your pages by using a custom decorator.

```
# /your-module/mailchimp-connector/templates/pages/your-page.yaml
areas:
  main:
    availableComponents
      mailchimpForm:
        id: mailchimp-connector:components/signupForm/signupForm
```

![Usage in signup form component](/_dev/add-component.jpg "Add Sign-up Form Component")
![Usage in signup form component](/_dev/select-audience.jpg "Select audience destination")
![Usage in signup form component](/_dev/form-component.jpg "Sign-up Form Component")

_Tip: To modify the look & feel of your subscribe forms login to your Mailchimp account, navigate to Audiences and click on Sign-up Forms menu item._

# Mailchimp Content App
A content app that contains two tabs, exist in the application. The tabs are Campaigns and Lists, that allow the user to perform some actions on the respective Mailchimp entity.

## Campaigns Tab
The Campaigns tab, shows a list of Campaigns:

!["Campaign Browser](/_dev/campaign-browser.png "Campaign Browser")
The following Actions are available:

1. Import Campaigns From Mailchimp
2. Add
3. Edit
4. Delete
5. Sync to Mailchimp

For every Campaign, the following information is displayed:
- Campaign ID
- Title
- Type (allowed types: plaintext/regular)
- From
- Subject
- List ID
- Schedule Date
- Campaign Status
- Sync Status (refer to [Sync Mailchimp Status](#Sync to Mailchimp Status))

### Action: Import Campaign
When the action Import Campaign From Mailchimp is selected, then a SubApp will open. The SubApp contains a list of Campaigns saved to Mailchimp.
![Import Campaign](/_dev/import-campaign.png "Import Campaign")
The confirm button will import this data from Mailchimp to JCR and the respective notification will be displayed.
![Import Campaign Notification](/_dev/import-campaign-notification.png "Import Campaign Notification")

### Action: Add/Edit Campaign
When selecting the Add/Edit Action, the user is prompted to fill the form with the following information.
![Add Campaign](/_dev/add-campaign.png "Add Campaign")
When the Confirm button is clicked, the form information is saved on JCR.

### Action: Delete Campaign
When a Campaign is selected, the Delete action will remove it from the JCR. The respective notification will be displayed.
![Delete Campaign](/_dev/delete-campaign.png "Delete Campaign")

### Action: Sync to Mailchimp
This action Schedules the selected campaign.

## Lists Tab
The Lists tab, shows a list of Lists(Audiences).
![List Browser](/_dev/list-browser.png "List Browser")
The following Actions are available:

1. Import Lists From Mailchimp
2. Add
3. Edit
4. Delete
5. Sync Status
6. Import Audience

For every List(Audience), the following information is displayed:
- List ID
- Name
- Members
- Sync Status (refer to [Sync Mailchimp Status](#Sync to Mailchimp Status))

### Action: Import Lists
When the action Import Campaign From Mailchimp is selected, then a SubApp will open. The SubApp contains a list of Lists(Audiences) saved to Mailchimp.
![Import Lists](/_dev/import-lists.png "Import Lists")
The confirm button will import this data from Mailchimp to JCR and the respective notification will be displayed.
![Import Lists Notification](/_dev/import-lists-notification.png "Import Lists Notification")

### Action: Add/Edit List
When selecting the Add/Edit Action, the user is prompted to fill the form with the following information.
![Add List](/_dev/add-list.png "Add List")
![Add List](/_dev/add-list2.png "Add List")
When the Save Changes button is clicked, the form information is saved on JCR.

### Action: Delete List
When a List is selected, the Delete action will remove it from the JCR. The respective notification will be displayed.
![Delete List](/_dev/delete-list.png "Delete List")

### Action: Sync Status
This action synchronizes the local JCR data with Mailchimp.

### Action: Import Audience
When the action is clicked, a new tab Import Audience is displayed.

### Import Audience
The tab Import Audience allows the user to create a connection between (existing or new) CSV files of a specific format and a List of Mailchimp. Every item of the Import Audience shows this connection between CSV and List. After the connection has been created, the item can be selected in order the emails of the CSV to be imported to the specified Mailchimp List.
![Import Audience](/_dev/import-audience.png "Import Audience")
The following Actions are available:

1. Create Import Audience Job (CSV) - visible when no items of the browser is clicked
2. Execute Batch Subscribe -  visible when one of the items of the browser is clicked

For every item of the Import Audience browser, the following information is displayed:
- Import Name
- List
- CSV File
- Status

#### Action: Create Import Audience Job (CSV)
When the action is clicked a new SubApp is displayed. The user can add the information of the form as shown below
![Create Batch Import](/_dev/create-batch-import.png "Create Batch Import")

The Import Name must be unique. Additionally, the CSV file must have the correct format, as shown in the sample below *(the header must be email_address and below must be the list of emails)*. 

[Sample CSV](./dev/sample_csv.csv)

#### Action: Execute Batch Subscribe
When an item of the browser is selected and the action is clicked, the content of the csv file is sent to Mailchimp in order to subscribe emails to the list.


## Sync to Mailchimp Status
An important piece of information for Campaigns and List entities is the Sync Status. This information is visible on the Campaigns browser and the Lists browser and can have one of the following statuses:
- Red: The JCR information of the selected item, does not exist in Mailchimp.
- Yellow: The JCR information (previously imported from Mailchimp), has been modified. This information is not the same as the Mailchimp respective information.
- Green: The JCR information of the selected item is the same as the Mailchimp respective information.
