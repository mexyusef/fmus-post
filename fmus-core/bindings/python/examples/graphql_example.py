"""
GraphQL example using FMUS-POST.
"""
import sys
import os
import json

# Add the src directory to the path so we can import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from fmus_post import graphql, GraphQLClient


def simple_query_example():
    """Demonstrate a simple GraphQL query."""
    print("Simple GraphQL Query Example")
    print("--------------------------")

    # Define endpoint (using the Star Wars example API)
    endpoint = "https://swapi-graphql.netlify.app/.netlify/functions/index"

    # Define query
    query = """
    query GetFilm {
      film(filmID: 1) {
        title
        director
        releaseDate
        speciesConnection {
          species {
            name
            classification
          }
        }
      }
    }
    """

    try:
        # Execute query
        print("Sending GraphQL query to Star Wars API...")
        result = graphql(endpoint, query=query)

        # Process results
        if result and 'film' in result:
            film = result['film']
            print(f"\nFilm: {film['title']}")
            print(f"Director: {film['director']}")
            print(f"Release Date: {film['releaseDate']}")

            print("\nSpecies in this film:")
            for species_edge in film['speciesConnection']['species']:
                print(f"  - {species_edge['name']} " +
                     f"({species_edge['classification']})")
        else:
            print("No film data received")

    except Exception as e:
        print(f"Error executing GraphQL query: {e}")


def client_with_variables_example():
    """Demonstrate using the GraphQL client with variables."""
    print("\nGraphQL Client with Variables Example")
    print("-----------------------------------")

    # Define endpoint (using the Star Wars example API)
    endpoint = "https://swapi-graphql.netlify.app/.netlify/functions/index"

    # Create client
    client = GraphQLClient(endpoint, {
        'headers': {
            'User-Agent': 'FMUS-POST Example/1.0'
        }
    })

    # Define query with variable
    query = """
    query GetPerson($id: ID!) {
      person(personID: $id) {
        name
        birthYear
        homeworld {
          name
        }
        filmConnection {
          films {
            title
          }
        }
      }
    }
    """

    try:
        # Execute query with variables
        print("Querying for a Star Wars character...")
        result = client.query(query, variables={'id': '1'})

        # Process results
        if result and 'person' in result:
            person = result['person']
            print(f"\nCharacter: {person['name']}")
            print(f"Birth Year: {person['birthYear']}")
            print(f"Homeworld: {person['homeworld']['name']}")

            print("\nAppears in films:")
            for film in person['filmConnection']['films']:
                print(f"  - {film['title']}")
        else:
            print("No character data received")

    except Exception as e:
        print(f"Error executing GraphQL query: {e}")


if __name__ == "__main__":
    simple_query_example()
    client_with_variables_example()
