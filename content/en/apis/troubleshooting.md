---
status: stub
---

# Troubleshooting

This page describes issues you may encounter when using Wikimedia APIs.

## 429 throttling

If you receive a `429 Too Many Requests` response from the API, your client has made too many requests and is being throttled. See information about [rate limiting best practices](/apis/rate-limits).

## Analytics data availability

Analytics data is loaded at the end of the time span in question. For example:
* Data for 2015-12-01 was loaded on 2015-12-02 00:00:00 UTC.
* Data for 2015-11-10 18:00:00 UTC was loaded on 2015-11-10 19:00:00 UTC.

Data loads into the API from a large stream of data. This process is usually done within a few hours, but can take 24 hours or more if there are problems.
To be notified of any significant delays in loading data, subscribe to the [analytics mailing list](https://lists.wikimedia.org/postorius/lists/analytics.lists.wikimedia.org/).

## High number of views for the "-" page

The dash value is used as a special value for "no page title found" when extracting titles from URLs, so a page titled "-" may appear to receive an unusually high number of page views.
