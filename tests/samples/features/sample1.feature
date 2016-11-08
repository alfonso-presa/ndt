@parallel
Feature: title

 Background:
  Given I perform some actions

Scenario: sample 1

 Given precondition
  When action
  Then testable outcome 1

Scenario: sample 2

 Given precondition
  When action
  When action 2
  Then testable outcome 2

Scenario: sample 3

 Given precondition
  When action
  When action 3
  Then testable outcome 3
