// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import {getRandomId} from '../../../utils';

describe('Account Settings > Sidebar > General', () => {
    // # number to identify particular user
    const randomId = getRandomId();

    let testTeam;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiCreateUser().then(({user: user1}) => {
                otherUser = user1;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
            });

            // # Login as test user, visit town-square and go to the Account Settings
            cy.apiLogin(testUser.username, testUser.password);
            cy.visit(`/${team.name}/channels/town-square`);
            cy.toAccountSettingsModal();

            // # Click General button
            cy.get('#generalButton').click();

            // # Open Full Name section
            cy.get('#nameDesc').click();

            // * Set first name value
            cy.get('#firstName').clear().type(`정트리나${randomId}/trina.jung/집단사무국(CO)`);

            // # save form
            cy.get('#saveSetting').click();
        });
    });

    it('M17459 - Filtering by first name with Korean characters', () => {
        cy.apiLogin(otherUser.username, otherUser.password);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # type in user`s firstName substring
        cy.get('#post_textbox').clear().type(`@정트리나${randomId}`);

        cy.findByTestId(testUser.username, {exact: false}).within((name) => {
            cy.wrap(name).prev('.suggestion-list__divider').
                should('have.text', 'Channel Members');
            cy.wrap(name).find('.mention--align').
                should('have.text', `@${testUser.username}`);
            cy.wrap(name).find('.ml-2').
                should('have.text', `정트리나${randomId}/trina.jung/집단사무국(CO) ${testUser.last_name} (${testUser.nickname})`);
        });

        // # Press tab on text input
        cy.get('#post_textbox').tab();

        // # verify that after enter user`s username match
        cy.get('#post_textbox').should('have.value', `@${testUser.username} `);

        // # click enter in post textbox
        cy.get('#post_textbox').type('{enter}');

        // # verify that message has been post in chat
        cy.get(`[data-mention="${testUser.username}"]`).
            last().
            scrollIntoView().
            should('be.visible');
    });
});
