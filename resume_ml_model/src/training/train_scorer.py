import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
import logging
import yaml
import joblib
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns

# Add src to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from data_processing.data_loader import ResumeDataLoader
from data_processing.feature_extraction import ResumeFeatureExtractor
from models.resume_scorer import ResumeScorer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResumeModelTrainer:
    """
    Main trainer class for resume analysis model
    """
    
    def __init__(self, config_path: str = "config/model_config.yaml"):
        """Initialize trainer with configuration"""
        
        self.config_path = config_path
        self.config = self.load_config()
        
        # Initialize components
        self.data_loader = ResumeDataLoader()
        self.feature_extractor = ResumeFeatureExtractor()
        self.scorer = None
        
        # Paths
        self.data_dir = Path("data")
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        
    def load_config(self) -> dict:
        """Load training configuration"""
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
            logger.info(f"Configuration loaded from {self.config_path}")
            return config
        except FileNotFoundError:
            logger.warning(f"Config file not found. Using default configuration.")
            return self.get_default_config()
    
    def get_default_config(self) -> dict:
        """Get default training configuration"""
        return {
            'data': {
                'synthetic_samples': 2000,
                'test_size': 0.2,
                'validation_size': 0.2,
                'random_state': 42
            },
            'model': {
                'type': 'ensemble',  # 'rf', 'gbm', 'ensemble', 'linear'
                'hyperparameter_tuning': True,
                'cross_validation_folds': 5
            },
            'features': {
                'max_tfidf_features': 1000,
                'include_text_features': True,
                'feature_selection': False,
                'feature_selection_k': 100
            },
            'training': {
                'save_model': True,
                'save_features': True,
                'create_plots': True,
                'verbose': True
            }
        }
    
    def prepare_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
        """
        Prepare training data
        
        Returns:
            Tuple of (training_data, features, targets)
        """
        logger.info("Preparing training data...")
        
        # Load or create dataset
        processed_data_path = self.data_dir / "processed" / "training_dataset.csv"
        
        if processed_data_path.exists():
            logger.info("Loading existing training dataset...")
            training_data = pd.read_csv(processed_data_path)
        else:
            logger.info("Creating new training dataset...")
            training_data = self.data_loader.create_training_dataset()
        
        if training_data.empty:
            raise ValueError("No training data available")
        
        logger.info(f"Training data loaded: {len(training_data)} samples")
        
        # Extract features
        logger.info("Extracting features from resume texts...")
        features_df = self.feature_extractor.process_dataset(training_data)
        
        # Prepare targets
        targets = training_data['quality_score'].astype(float)
        
        # Validate data
        assert len(features_df) == len(targets), "Feature and target count mismatch"
        
        logger.info(f"Feature extraction complete: {features_df.shape[1]} features")
        
        return training_data, features_df, targets
    
    def split_data(self, features_df: pd.DataFrame, targets: pd.Series) -> Tuple:
        """
        Split data into train/validation/test sets
        
        Returns:
            Tuple of (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        config = self.config['data']
        
        # First split: train+val vs test
        X_temp, X_test, y_temp, y_test = train_test_split(
            features_df, targets,
            test_size=config['test_size'],
            random_state=config['random_state'],
            stratify=pd.cut(targets, bins=5, labels=False)  # Stratify by score ranges
        )
        
        # Second split: train vs validation
        val_size = config['validation_size'] / (1 - config['test_size'])
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=val_size,
            random_state=config['random_state'],
            stratify=pd.cut(y_temp, bins=5, labels=False)
        )
        
        logger.info(f"Data split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def train_model(self, X_train: pd.DataFrame, y_train: pd.Series, 
                   X_val: pd.DataFrame, y_val: pd.Series) -> dict:
        """
        Train the resume scoring model
        
        Returns:
            Training results dictionary
        """
        model_config = self.config['model']
        
        # Initialize scorer
        self.scorer = ResumeScorer(model_type=model_config['type'])
        
        if model_config['hyperparameter_tuning'] and model_config['type'] != 'ensemble':
            logger.info("Performing hyperparameter tuning...")
            tuning_results = self.scorer.hyperparameter_tuning(X_train, y_train)
            logger.info(f"Best hyperparameters: {tuning_results.get('best_params', {})}")
        else:
            logger.info("Training model with default parameters...")
            training_results = self.scorer.train(X_train, y_train, validation_split=0.0)
        
        # Evaluate on validation set
        val_metrics = self.scorer.evaluate_model(X_val, y_val)
        logger.info(f"Validation metrics: {val_metrics}")
        
        return {
            'validation_metrics': val_metrics,
            'model_type': model_config['type']
        }
    
    def evaluate_model(self, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
        """
        Evaluate the trained model on test set
        
        Returns:
            Test evaluation metrics
        """
        logger.info("Evaluating model on test set...")
        
        test_metrics = self.scorer.evaluate_model(X_test, y_test)
        predictions = self.scorer.predict(X_test)
        
        # Additional analysis
        test_metrics['predictions_stats'] = {
            'mean': float(np.mean(predictions)),
            'std': float(np.std(predictions)),
            'min': float(np.min(predictions)),
            'max': float(np.max(predictions))
        }
        
        logger.info(f"Test R²: {test_metrics['r2']:.3f}")
        logger.info(f"Test RMSE: {test_metrics['rmse']:.2f}")
        logger.info(f"Test MAE: {test_metrics['mae']:.2f}")
        
        return test_metrics, predictions
    
    def create_visualizations(self, y_test: pd.Series, predictions: np.ndarray, 
                            test_metrics: dict):
        """Create training and evaluation visualizations"""
        
        if not self.config['training']['create_plots']:
            return
        
        logger.info("Creating visualizations...")
        
        # Set up the plotting style
        plt.style.use('seaborn-v0_8')
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # 1. Actual vs Predicted scatter plot
        axes[0, 0].scatter(y_test, predictions, alpha=0.6)
        axes[0, 0].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
        axes[0, 0].set_xlabel('Actual Scores')
        axes[0, 0].set_ylabel('Predicted Scores')
        axes[0, 0].set_title(f'Actual vs Predicted (R² = {test_metrics["r2"]:.3f})')
        
        # 2. Residuals plot
        residuals = predictions - y_test
        axes[0, 1].scatter(predictions, residuals, alpha=0.6)
        axes[0, 1].axhline(y=0, color='r', linestyle='--')
        axes[0, 1].set_xlabel('Predicted Scores')
        axes[0, 1].set_ylabel('Residuals')
        axes[0, 1].set_title('Residuals Plot')
        
        # 3. Distribution of predictions vs actual
        axes[1, 0].hist(y_test, bins=20, alpha=0.7, label='Actual', density=True)
        axes[1, 0].hist(predictions, bins=20, alpha=0.7, label='Predicted', density=True)
        axes[1, 0].set_xlabel('Scores')
        axes[1, 0].set_ylabel('Density')
        axes[1, 0].set_title('Score Distributions')
        axes[1, 0].legend()
        
        # 4. Feature importance (top 15)
        importance_df = self.scorer.get_feature_importance().head(15)
        axes[1, 1].barh(range(len(importance_df)), importance_df['importance'])
        axes[1, 1].set_yticks(range(len(importance_df)))
        axes[1, 1].set_yticklabels(importance_df['feature'])
        axes[1, 1].set_xlabel('Importance')
        axes[1, 1].set_title('Top 15 Feature Importance')
        
        plt.tight_layout()
        
        # Save plot
        plot_path = self.models_dir / 'training_results.png'
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        logger.info(f"Visualizations saved to {plot_path}")
        
        plt.show()
    
    def save_model_artifacts(self):
        """Save trained model and associated artifacts"""
        
        if not self.config['training']['save_model']:
            return
        
        logger.info("Saving model artifacts...")
        
        # Create directories
        (self.models_dir / 'trained').mkdir(exist_ok=True)
        
        # Save the trained model
        model_path = self.models_dir / 'trained' / 'resume_scorer.joblib'
        self.scorer.save_model(str(model_path))
        
        # Save feature extractor and vectorizers
        if self.config['training']['save_features']:
            feature_path = self.models_dir / 'trained' / 'feature_extractor.joblib'
            self.feature_extractor.save_vectorizers(str(feature_path))
        
        # Save feature importance
        importance_df = self.scorer.get_feature_importance()
        importance_path = self.models_dir / 'trained' / 'feature_importance.csv'
        importance_df.to_csv(importance_path, index=False)
        
        logger.info("Model artifacts saved successfully!")
    
    def run_full_training_pipeline(self):
        """
        Run the complete training pipeline
        """
        logger.info("Starting full training pipeline...")
        
        try:
            # 1. Prepare data
            training_data, features_df, targets = self.prepare_data()
            
            # 2. Split data
            X_train, X_val, X_test, y_train, y_val, y_test = self.split_data(features_df, targets)
            
            # 3. Train model
            training_results = self.train_model(X_train, y_train, X_val, y_val)
            
            # 4. Evaluate model
            test_metrics, predictions = self.evaluate_model(X_test, y_test)
            
            # 5. Create visualizations
            self.create_visualizations(y_test, predictions, test_metrics)
            
            # 6. Save model artifacts
            self.save_model_artifacts()
            
            # 7. Print final results
            self.print_final_results(training_results, test_metrics)
            
            logger.info("Training pipeline completed successfully!")
            
            return {
                'training_results': training_results,
                'test_metrics': test_metrics,
                'model_path': str(self.models_dir / 'trained' / 'resume_scorer.joblib')
            }
            
        except Exception as e:
            logger.error(f"Training pipeline failed: {str(e)}")
            raise
    
    def print_final_results(self, training_results: dict, test_metrics: dict):
        """Print comprehensive training results"""
        
        print("\n" + "="*60)
        print("RESUME SCORING MODEL - TRAINING RESULTS")
        print("="*60)
        
        print(f"\nModel Type: {training_results['model_type']}")
        print(f"Features Used: {len(self.scorer.feature_names)}")
        
        print(f"\nTest Set Performance:")
        print(f"  R² Score: {test_metrics['r2']:.4f}")
        print(f"  RMSE: {test_metrics['rmse']:.2f}")
        print(f"  MAE: {test_metrics['mae']:.2f}")
        print(f"  Mean Error: {test_metrics['mean_error']:.2f}")
        
        print(f"\nPrediction Statistics:")
        stats = test_metrics['predictions_stats']
        print(f"  Mean Predicted Score: {stats['mean']:.1f}")
        print(f"  Std Predicted Score: {stats['std']:.1f}")
        print(f"  Score Range: {stats['min']:.1f} - {stats['max']:.1f}")
        
        print(f"\nTop 10 Most Important Features:")
        importance_df = self.scorer.get_feature_importance().head(10)
        for idx, row in importance_df.iterrows():
            print(f"  {row['feature']}: {row['importance']:.4f}")
        
        print("\n" + "="*60)

def main():
    """Main training function"""
    
    # Create config directory and file if it doesn't exist
    config_dir = Path("config")
    config_dir.mkdir(exist_ok=True)
    
    config_file = config_dir / "model_config.yaml"
    if not config_file.exists():
        # Create default config
        default_config = {
            'data': {
                'synthetic_samples': 2000,
                'test_size': 0.2,
                'validation_size': 0.2,
                'random_state': 42
            },
            'model': {
                'type': 'ensemble',
                'hyperparameter_tuning': False,  # Set to True for better results but longer training
                'cross_validation_folds': 5
            },
            'features': {
                'max_tfidf_features': 1000,
                'include_text_features': True,
                'feature_selection': False,
                'feature_selection_k': 100
            },
            'training': {
                'save_model': True,
                'save_features': True,
                'create_plots': True,
                'verbose': True
            }
        }
        
        with open(config_file, 'w') as f:
            yaml.dump(default_config, f, default_flow_style=False)
        
        logger.info(f"Created default config file: {config_file}")
    
    # Initialize and run trainer
    trainer = ResumeModelTrainer(str(config_file))
    results = trainer.run_full_training_pipeline()
    
    return results

if __name__ == "__main__":
    results = main() 