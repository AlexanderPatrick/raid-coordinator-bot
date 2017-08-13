module.exports = {
    createListForChannelIfNotExists: function(list, channelId) {
        if (!list.hasOwnProperty(channelId)) {
            list[channelId] = [];
        }
        return list;
    },
    
    addDefaultRaiderToRaiderListIfNotExist: function(raiderList, raiderName) {
        if (!raiderList.map(raider => raider.name).includes(raiderName)) {
            raiderList.push({name: raiderName, count: 1, here: false});
        }
        return raiderList;
    },

    addDefaultRaiderTallyToTallyListIfNotExist: function(tallyList, raiderName) {
        if (!tallyList.map(raider => raider.name).includes(raiderName)) {
            tallyList.push({name: raiderName, caught: 0, ran: 0});
        }
        return tallyList;
    }
}