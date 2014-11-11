
define([
    '../util/ajax',
    '../util/store'
], function(ajax, store) {
    'use strict';

    var api = {
        search: function(options) {
            var params = {},
                q = _.isUndefined(options.query.query) ?
                    options.query :
                    options.query.query;

            if (options.conceptFilter) params.conceptType = options.conceptFilter;
            if (options.paging) {
                if (options.paging.offset) params.offset = options.paging.offset;
                if (options.paging.size) params.size = options.paging.size;
            }

            if (q) {
                params.q = q;
            }
            if (options.query && options.query.relatedToVertexId) {
                params.relatedToVertexId = options.query.relatedToVertexId;
            }
            params.filter = JSON.stringify(options.propertyFilters || []);

            return ajax('GET', '/vertex/search', params);
        },

        multiple: function(options) {
            return ajax('POST', '/vertex/multiple', options);
        },

        store: function(opts) {
            var options = _.extend({
                    workspaceId: publicData.currentWorkspaceId
                }, opts),
                returnSingular = false,
                vertexIds = options.vertexIds;

            if (!_.isArray(vertexIds)) {
                returnSingular = true;
                vertexIds = [vertexIds];
            }

            var vertices = store.getObjects(options.workspaceId, 'vertex', vertexIds),
                toRequest = [];

            vertices.forEach(function(vertex, i) {
                if (!vertex) {
                    toRequest.push(vertexIds[i]);
                }
            });

            if (toRequest.length === 0) {
                return Promise.resolve(returnSingular ? vertices[0] : vertices);
            } else {
                return api.multiple({
                    vertexIds: toRequest
                }).then(function(requested) {
                    results = vertices.map(function(vertex) {
                        if (vertex) {
                            return vertex;
                        }

                        return requested.shift();
                    });
                    return returnSingular ? results[0] : results;
                })
            }
        }
    };

    return api;
});