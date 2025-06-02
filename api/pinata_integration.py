"""
Pinata IPFS integration for PromptCraft backend
"""
import os
import json
import requests
from typing import Dict, Any, Optional
from datetime import datetime

class PinataManager:
    """Handle Pinata IPFS operations for the backend"""
    
    def __init__(self):
        self.api_key = os.getenv('PINATA_API_KEY')
        self.api_secret = os.getenv('PINATA_API_SECRET')
        self.jwt = os.getenv('PINATA_JWT')
        self.base_url = 'https://api.pinata.cloud'
        self.gateway_url = 'https://gateway.pinata.cloud'
        
        if not all([self.api_key, self.api_secret, self.jwt]):
            raise ValueError("Missing Pinata credentials in environment variables")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Pinata API requests"""
        return {
            'Authorization': f'Bearer {self.jwt}',
            'Content-Type': 'application/json'
        }
    
    def upload_json(self, data: Dict[str, Any], name: str, metadata: Optional[Dict] = None) -> str:
        """
        Upload JSON data to IPFS via Pinata
        
        Args:
            data: The JSON data to upload
            name: Name for the uploaded file
            metadata: Optional metadata for the file
            
        Returns:
            IPFS hash of the uploaded data
        """
        url = f"{self.base_url}/pinning/pinJSONToIPFS"
        
        payload = {
            "pinataContent": data,
            "pinataMetadata": {
                "name": name,
                "keyvalues": metadata or {}
            }
        }
        
        response = requests.post(url, json=payload, headers=self._get_headers())
        response.raise_for_status()
        
        return response.json()['IpfsHash']
    
    def upload_file(self, file_path: str, name: str, metadata: Optional[Dict] = None) -> str:
        """
        Upload a file to IPFS via Pinata
        
        Args:
            file_path: Path to the file to upload
            name: Name for the uploaded file
            metadata: Optional metadata for the file
            
        Returns:
            IPFS hash of the uploaded file
        """
        url = f"{self.base_url}/pinning/pinFileToIPFS"
        
        with open(file_path, 'rb') as file:
            files = {
                'file': (name, file, 'application/octet-stream')
            }
            
            data = {
                'pinataMetadata': json.dumps({
                    "name": name,
                    "keyvalues": metadata or {}
                })
            }
            
            headers = {'Authorization': f'Bearer {self.jwt}'}
            
            response = requests.post(url, files=files, data=data, headers=headers)
            response.raise_for_status()
            
            return response.json()['IpfsHash']
    
    def retrieve_data(self, ipfs_hash: str) -> Any:
        """
        Retrieve data from IPFS
        
        Args:
            ipfs_hash: The IPFS hash to retrieve
            
        Returns:
            The retrieved data
        """
        url = f"{self.gateway_url}/ipfs/{ipfs_hash}"
        
        response = requests.get(url)
        response.raise_for_status()
        
        # Try to parse as JSON, fallback to text
        try:
            return response.json()
        except json.JSONDecodeError:
            return response.text
    
    def upload_evaluation_to_ipfs(self, evaluation_data: Dict[str, Any]) -> str:
        """
        Upload evaluation data to IPFS
        
        Args:
            evaluation_data: The evaluation data to upload
            
        Returns:
            IPFS hash of the uploaded evaluation
        """
        name = f"evaluation_{evaluation_data.get('candidate_id', 'unknown')}_task{evaluation_data.get('task_id', 'unknown')}_{int(datetime.now().timestamp())}"
        
        # Add timestamp if not present
        if 'timestamp' not in evaluation_data:
            evaluation_data['timestamp'] = datetime.now().isoformat()
        
        metadata = {
            'type': 'evaluation',
            'candidate_id': str(evaluation_data.get('candidate_id', '')),
            'task_id': str(evaluation_data.get('task_id', '')),
            'evaluator_id': str(evaluation_data.get('evaluator_user_id', '')),
            'created_at': evaluation_data['timestamp']
        }
        
        return self.upload_json(evaluation_data, name, metadata)
    
    def upload_submission_to_ipfs(self, submission_data: Dict[str, Any]) -> str:
        """
        Upload submission data to IPFS
        
        Args:
            submission_data: The submission data to upload
            
        Returns:
            IPFS hash of the uploaded submission
        """
        name = f"submission_user{submission_data.get('user_id', 'unknown')}_task{submission_data.get('task_id', 'unknown')}_{int(datetime.now().timestamp())}"
        
        # Add timestamp if not present
        if 'timestamp' not in submission_data:
            submission_data['timestamp'] = datetime.now().isoformat()
        
        metadata = {
            'type': 'submission',
            'user_id': str(submission_data.get('user_id', '')),
            'task_id': str(submission_data.get('task_id', '')),
            'created_at': submission_data['timestamp']
        }
        
        return self.upload_json(submission_data, name, metadata)
    
    def list_pinned_files(self, metadata_filter: Optional[Dict] = None) -> Dict[str, Any]:
        """
        List pinned files from Pinata
        
        Args:
            metadata_filter: Optional metadata filter
            
        Returns:
            List of pinned files
        """
        url = f"{self.base_url}/data/pinList"
        
        params = {}
        if metadata_filter:
            params['metadata'] = metadata_filter
        
        response = requests.get(url, headers=self._get_headers(), params=params)
        response.raise_for_status()
        
        return response.json()
    
    def unpin_file(self, ipfs_hash: str) -> bool:
        """
        Unpin a file from Pinata
        
        Args:
            ipfs_hash: The IPFS hash to unpin
            
        Returns:
            True if successful
        """
        url = f"{self.base_url}/pinning/unpin/{ipfs_hash}"
        
        response = requests.delete(url, headers=self._get_headers())
        response.raise_for_status()
        
        return True


# Example usage functions
def save_evaluation_to_ipfs(evaluation_data: Dict[str, Any]) -> str:
    """Save evaluation data to IPFS and return the hash"""
    pinata = PinataManager()
    return pinata.upload_evaluation_to_ipfs(evaluation_data)

def save_submission_to_ipfs(submission_data: Dict[str, Any]) -> str:
    """Save submission data to IPFS and return the hash"""
    pinata = PinataManager()
    return pinata.upload_submission_to_ipfs(submission_data)

def get_data_from_ipfs(ipfs_hash: str) -> Any:
    """Retrieve data from IPFS by hash"""
    pinata = PinataManager()
    return pinata.retrieve_data(ipfs_hash)