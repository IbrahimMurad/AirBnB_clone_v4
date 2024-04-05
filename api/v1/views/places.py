#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Places """
from models.state import State
from models.city import City
from models.place import Place
from models.user import User
from models.amenity import Amenity
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/cities/<city_id>/places', methods=['GET'],
                 strict_slashes=False)
@swag_from('documentation/place/get_places.yml', methods=['GET'])
def get_places(city_id):
    """
    Retrieves the list of all Place objects of a City
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    places = [place.to_dict() for place in city.places]

    return jsonify(places)


@app_views.route('/places/<place_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/place/get_place.yml', methods=['GET'])
def get_place(place_id):
    """
    Retrieves a Place object
    """
    place = storage.get(Place, place_id)
    if not place:
        abort(404)

    return jsonify(place.to_dict())


@app_views.route('/places/<place_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/place/delete_place.yml', methods=['DELETE'])
def delete_place(place_id):
    """
    Deletes a Place Object
    """

    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    storage.delete(place)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/cities/<city_id>/places', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/place/post_place.yml', methods=['POST'])
def post_place(city_id):
    """
    Creates a Place
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    if 'user_id' not in request.get_json():
        abort(400, description="Missing user_id")

    data = request.get_json()
    user = storage.get(User, data['user_id'])

    if not user:
        abort(404)

    if 'name' not in request.get_json():
        abort(400, description="Missing name")

    data["city_id"] = city_id
    instance = Place(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/places/<place_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/place/put_place.yml', methods=['PUT'])
def put_place(place_id):
    """
    Updates a Place
    """
    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    data = request.get_json()
    if not data:
        abort(400, description="Not a JSON")

    ignore = ['id', 'user_id', 'city_id', 'created_at', 'updated_at']

    for key, value in data.items():
        if key not in ignore:
            setattr(place, key, value)
    storage.save()
    return make_response(jsonify(place.to_dict()), 200)


@app_views.route('/places_search', methods=['POST'], strict_slashes=False)
@swag_from('documentation/place/post_search.yml', methods=['POST'])
def places_search():
    """ Retrieves the list of all Places filtered by state,
    city and amenities """

    # 1. if not valid json abort 400 'Not a JSON'
    if request.content_type != "application/json":
        abort(400, "Not a JSON")

    places = storage.all(Place).values()

    # 2. if json body is empty or all keys are empty
    data = request.get_json()
    states_ids = data.get('states', [])
    cities_ids = data.get('cities', [])
    amenities_ids = data.get('amenities', [])
    if not data or not (states_ids or cities_ids or amenities_ids):
        return jsonify([place.to_dict() for place in places])

    # 3. if states or cities not empty, retreive them all
    states = [storage.get(State, id) for id in states_ids]
    cities = [storage.get(City, id) for id in cities_ids]

    # drop none values in states and cities lists
    # that comes if storage.get returns None
    states = [state for state in states if state]
    cities = [city for city in cities if city]

    # 4. retrieve all places in the states and its cities
    # plus all in the cities unless if it is already listed by the states
    states_cities = [city for state in states for city in state.cities]
    req_cities = [city for city in cities if city not in states_cities]
    req_cities.extend(states_cities)

    # 5. if amenities is not empty, than return all places
    # with the specified  amenities only, no more, no less.
    amenities = [storage.get(Amenity, id) for id in amenities_ids]
    amenities = [amenity for amenity in amenities if amenity]

    req_places = [place for city in req_cities
                  for place in city.places]
    if not req_places:
        req_places = places

    req_places = [place.to_dict() for place in req_places
                  if all(amenity in place.amenities
                         for amenity in amenities)]
    for place in req_places:
        if 'amenities' in place:
            del place['amenities']

    return jsonify(req_places)
